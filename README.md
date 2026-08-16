**Agentic QA Planning Assistant**

An AI-assisted QA planning workspace that turns a software requirement, acceptance criteria, and implementation summary into a structured, reviewable QA plan. The assistant combines AI-based reasoning with deterministic validation and human review. It proposes tests, identifies risks and gaps, maps tests to acceptance criteria, and stores reviewed QA plans as versioned artifacts.

**Important:** 

The assistant proposes tests. It does not execute them, mark a feature as passed, or declare a feature release-ready.

**Overview**

When a developer makes a change to a software feature, deciding what needs to be tested can require manually translating requirements into multiple kinds of test cases. This application helps with that process.
A developer provides:
1. A requirement or user story
2. Acceptance criteria
3. An implementation/change summary

The application then:
1. Retrieves relevant QA guidance from a small local knowledge base.
2. Sends the developer context and retrieved guidance to the AI.
3. Identifies important user flows, assumptions, risks, and regression areas.
4. Proposes appropriate test cases.
5. Maps generated tests to acceptance criteria.
6. Deterministically calculates acceptance-criteria coverage.
7. Detects incomplete and potentially duplicate tests.
8. Allows a developer to edit, approve, reject, or reprioritize tests.
9. Saves reviewed QA plans.
10. Maintains version history for reviewed plans.

**How It Works**

```text
Developer Input
      │
      ├── Requirement / User Story
      ├── Acceptance Criteria
      └── Implementation Summary
      │
      ▼
Knowledge Retrieval
      │
      ▼
AI QA Analysis
      │
      ├── User Flows
      ├── Assumptions
      ├── Risks
      ├── Regression Areas
      └── Proposed Tests
      │
      ▼
Deterministic Validation
      │
      ├── Acceptance Criteria Coverage
      ├── Uncovered Criteria
      ├── Incomplete Tests
      ├── Invalid Mappings
      └── Duplicate Detection
      │
      ▼
Human Review
      │
      ├── Edit
      ├── Approve
      ├── Reject
      └── Reprioritize
      │
      ▼
Versioned QA Plan
```

**Key Features**

The developer provides the application with:

**1. Requirement / User Story**

- Describes what is being built or changed.

**2. Acceptance Criteria**

- Defines the expected behaviour that the QA plan should cover.

**3. Implementation Summary**

- Provides technical context about what changed, helping the assistant identify risks and regression areas.

**QA Knowledge Base**

The application uses a small local QA knowledge base rather than relying entirely on the model's general knowledge.

The knowledge base contains guidance covering areas such as:

- Positive testing
- Negative testing
- Boundary testing
- Permission testing
- Failure testing
- Regression testing
- Test independence
- Unit testing
- API testing
- Integration testing
- End-to-end testing
- Playwright testing
- Manual testing
- Usability testing

Relevant guidance is retrieved based on the developer's input and supplied to the AI as additional context.

**Knowledge Base**

```
server/
└── knowledge/
    ├── qa-principles.md
    └── testing-types.md
```
**AI Analysis**

The AI acts as a practical QA engineer helping review a software change.

It identifies:

**1. User Flows**

The main workflows affected by the change.

**2. Assumptions**

Important details that are not explicitly specified in the provided context.

Instead of silently inventing missing requirements, the assistant makes assumptions visible to the reviewer.

**3. Risks**

Potential areas where the implementation could fail or negatively affect users, data, permissions, integrations, or existing behaviour.

**4. Regression Areas**

Existing functionality that may be affected by the change.

**Test Generation**

The assistant proposes test cases using the test type that makes sense for the feature.

Supported test types include:

- Unit
- API
- Integration
- End-to-End
- Playwright
- Manual

The assistant can consider:

- Positive scenarios
- Negative scenarios
- Edge cases
- Boundary conditions
- Permission cases
- Failure states
- Regression scenarios

Each proposed test contains information such as:
```
Test ID
Title
Type
Framework
Priority
Preconditions
Steps
Expected Result
Acceptance Criteria Mapping
Rationale
Review Status
```

The assistant also explains why each test is relevant so that developers can review the reasoning rather than blindly accepting generated output.

**Deterministic Validation**

A key design decision in this project is separating AI-generated reasoning from deterministic application logic.

The AI proposes tests.

The application independently validates the generated plan.

This prevents the model from being responsible for claims that can be calculated reliably in code.

**Acceptance Criteria Coverage**

The application maps generated tests to acceptance criteria and calculates coverage using deterministic logic.

For Example:
```
Acceptance Criteria: 4

Covered:             3
Uncovered:           1

Coverage:            75%
```
Uncovered criteria are explicitly highlighted for review.

**Incomplete Test Detection** : The application validates whether the proposed tests contain the information needed to be actionable. 
Ex; Test steps, expected results, acceptance - criteria mappings etc. 

**Duplicate Detection** : Duplicacy in test cases are identified so that reviewers can decide if they should be merged, rejected or differentiated. 

**Validation Issues** : Issues like Uncovered acceptance criteria, Invalid acceptance-criteria mappings, Incomplete tests etc. are presented seperately from the AI analysis. 

**Human Review Wokrflow**

Every proposed test can be reviewed by the developer as such: 

- Edit: Modify test title, priority, steps, result expectation etc.
- Approve: Mark a proposed test as approved.
- Reject: Make a test as rejected.

**Versioned QA Plans** : Reviewed plans can be saved and versioned, allowing changes made during review to be preserved. 

**Architecture**

```
QA_assessment/
│
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   ├── public/
│   │
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       └── assets/
│
└── server/
    ├── server.js
    ├── qa-plans.json
    ├── package.json
    │
    ├── data/
    │   ├── analysis.example.js
    │   ├── example-plan.json
    │   └── test-case.example.js
    │
    ├── knowledge/
    │   ├── qa-principles.md
    │   └── testing-types.md
    │
    ├── services/
    │   ├── aiService.js
    │   ├── knowledgeService.js
    │   └── qaPlanService.js
    │
    └── utils/
        ├── coverage.js
        ├── duplicateDetection.js
        ├── qaValidator.js
        └── testValidation.js
```

**Tech Stack**

**Frontend**

- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express
- CORS

**AI**
- Google Gemini API
- @google/genai

**Storage** : The current implementation uses a JSON-based persistance layer for saved QA Plans and versions.
``` server/qa-plans.json```

**Running the Project Locally**

Prerequisites: Node.js and npm should be installed. Also need a Gemini API key.

**1. Clone the repository**

```
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd QA_assessment
```

**2. Install frontend dependencies**

```
cd client
npm install
```

**3. Install backend dependencies**

Open another terminal:
```
cd server
npm install
```

**4. Configure the Gemini API key**

Create: ``` server/.env ```

Add: 

```
GEMINI_API_KEY=your_gemini_api_key
```

API key should not be committed to Git. 

**5. Start the backend**

From the server directory:

```
node server.js
```

The backend runs on:

```
http://localhost:5000
```

**6. Start the frontend**

From the client director: 
```
npm run dev
```
Open the local URL shown by Vite in the terminal. 

**Error Handling**

The application handles common AI and API failures without exposing raw provider errors to the end user and also handles invalid AI JSON responses and reports that could not be generated, instead of displaying incorrect output. 
