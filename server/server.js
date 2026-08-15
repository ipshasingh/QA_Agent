const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const { generateQAPlan } = require("./services/aiService");
const { validateQAPlan } = require("./utils/qaValidator");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "QA Planning Assistant API is running!",
  });
});

app.post("/api/qa-plan", async (req, res) => {
  try {
    const {
      requirement,
      acceptanceCriteria,
      implementationSummary,
    } = req.body;

    if (!requirement || !acceptanceCriteria || !implementationSummary) {
      return res.status(400).json({
        error:
          "Requirement, acceptance criteria and implementation summary are required.",
      });
    }

    const qaPlan = await generateQAPlan({
      requirement,
      acceptanceCriteria,
      implementationSummary,
    });

    const validation = validateQAPlan(
      parseAcceptanceCriteria(acceptanceCriteria),
      qaPlan.tests || []
    );

    const finalPlan = {
      ...qaPlan,
      coverage: validation.coverage,
      validation: validation.validation,
      duplicates: validation.duplicates,
      issues: validation.issues,
    };

    res.json(finalPlan);
  } catch (error) {
    console.error("QA plan generation error:");
    console.error("Status:", error.status);
    console.error("Message:", error.message);

    res.status(500).json({
      error:
        error.message || "Failed to generate QA plan.",
    });
  }
});

function parseAcceptanceCriteria(acceptanceCriteria) {
  if (Array.isArray(acceptanceCriteria)) {
    return acceptanceCriteria;
  }

  return acceptanceCriteria
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(AC-\d+)\s*:\s*(.*)$/);

      if (match) {
        return {
          id: match[1],
          text: match[2],
        };
      }

      return {
        id: `AC-${Math.random().toString(36).slice(2, 8)}`,
        text: line,
      };
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});