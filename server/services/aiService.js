const { GoogleGenAI } = require("@google/genai");
const {
  retrieveRelevantGuidance
} = require("./knowledgeService");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateWithRetry(options, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error) {
      lastError = error;

      const status = error.status;

      const isTemporaryError =
        status === 503 ||
        status === 429;

      if (!isTemporaryError || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt - 1);

      console.log(
        `Gemini temporarily unavailable (${status}). ` +
        `Retrying in ${delay / 1000}s... ` +
        `Attempt ${attempt + 1}/${maxAttempts}`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
}

async function generateQAPlan({
  requirement,
  acceptanceCriteria,
  implementationSummary
}) {
  const combinedInput = `
Requirement:
${requirement}

Acceptance Criteria:
${acceptanceCriteria}

Implementation Summary:
${implementationSummary}
`;

  const knowledge = retrieveRelevantGuidance(combinedInput);

  const retrievedGuidance = knowledge.documents
    .map((document) => {
      return `SOURCE: ${document.file}\n${document.content}`;
    })
    .join("\n\n");

  const prompt = `
You are a QA planning assistant helping a software developer
design a thorough but practical QA plan.

IMPORTANT:
You propose tests.
You do NOT execute tests.
You do NOT say that a feature has passed.
You do NOT declare a feature release-ready.

Analyze the developer's input and produce a structured QA plan.

DEVELOPER INPUT
================

Requirement:
${requirement}

Acceptance Criteria:
${acceptanceCriteria}

Implementation Summary:
${implementationSummary}

RELEVANT QA GUIDANCE
====================

${retrievedGuidance}

YOUR TASK
=========

1. Identify the main user flows affected by the change.

2. Identify important assumptions when the provided context
   is incomplete.

3. Identify risks associated with the change.

4. Identify likely regression areas.

5. Generate appropriate proposed test cases.

Consider these test types where appropriate:
- unit
- api
- integration
- e2e
- playwright
- manual

Do NOT generate every test type automatically.
Choose the types that make sense for the feature.

6. Consider:
- positive cases
- negative cases
- edge cases
- permission cases
- failure states
- regression scenarios

7. Map every generated test to one or more acceptance
   criteria using their IDs.

8. Explain why every proposed test is relevant.

9. Identify potentially duplicate or incomplete tests.

10. Clearly state assumptions rather than silently inventing
    missing requirements.

IMPORTANT:
Acceptance-criteria coverage will be calculated separately
by application code. Do NOT calculate or invent a coverage
percentage yourself.

Return ONLY valid JSON.
Do not use Markdown.
Do not wrap the JSON in code fences.

The JSON must follow this structure:

{
  "analysis": {
    "userFlows": [
      {
        "id": "FLOW-001",
        "name": "string",
        "description": "string"
      }
    ],
    "assumptions": [
      {
        "text": "string",
        "impact": "string"
      }
    ],
    "risks": [
      {
        "area": "string",
        "level": "critical | high | medium | low",
        "reason": "string"
      }
    ],
    "regressionAreas": [
      "string"
    ]
  },

  "tests": [
    {
      "id": "TC-001",
      "title": "string",
      "type": "unit | api | integration | e2e | playwright | manual",
      "framework": "string or null",
      "priority": "critical | high | medium | low",
      "preconditions": [
        "string"
      ],
      "steps": [
        "string"
      ],
      "expectedResult": "string",
      "acceptanceCriteriaIds": [
        "AC-001"
      ],
      "rationale": "string",
      "status": "proposed"
    }
  ],

  "qualityIssues": {
    "duplicates": [
      {
        "testIds": [
          "TC-001",
          "TC-002"
        ],
        "reason": "string"
      }
    ],
    "incompleteTests": [
      {
        "testId": "TC-001",
        "reason": "string"
      }
    ]
  }
}
`;

  const response = await generateWithRetry({
  model: "gemini-3.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json"
  }
});

  const text = response.text;

console.log("RAW GEMINI RESPONSE:");
console.log(text);

try {
  return JSON.parse(text);
} catch (parseError) {
  console.error("GEMINI RETURNED INVALID JSON");
  console.error(parseError.message);

  throw new Error(
    "Gemini returned invalid JSON. Please try generating the QA plan again."
  );
}
}

module.exports = {
  generateQAPlan
};
