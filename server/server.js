const express = require("express"); 
const cors = require("cors"); 
const path = require("path"); 
 
require("dotenv").config({ 
  path: path.join(__dirname, ".env"), 
}); 
 
const { 
  createQAPlan, 
  createQAVersion, 
  getQAPlans, 
  getQAVersions 
} = require("./services/qaPlanService"); 
 
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

    if (
      !requirement ||
      !acceptanceCriteria ||
      !implementationSummary
    ) {
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

  }catch (error) {
  console.error("QA plan generation error:");
  console.error("Status:", error.status);
  console.error("Code:", error.code);
  console.error("Message:", error.message);

  const errorMessage = String(error.message || "");

  const isRateLimitError =
    error.status === 429 ||
    error.code === 429 ||
    errorMessage.includes('"code":429') ||
    errorMessage.includes("RESOURCE_EXHAUSTED") ||
    errorMessage.includes("quota exceeded");

  if (isRateLimitError) {
    return res.status(429).json({
      error:
        "AI generation is temporarily unavailable because the Gemini API quota has been reached. You can continue working with saved QA plans."
    });
  }

  const isBadRequest =
    error.status === 400 ||
    error.code === 400;

  if (isBadRequest) {
    return res.status(400).json({
      error:
        "The AI could not process the provided QA planning input. Please check the requirement, acceptance criteria, and implementation summary."
    });
  }

  return res.status(500).json({
    error:
      "The QA plan could not be generated. Please try again later."
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
 
app.post("/api/qa-plans", (req, res) => { 
  try { 
    const plan = req.body; 
 
    if (!plan) { 
      return res.status(400).json({ 
        error: "QA plan is required." 
      }); 
    } 
 
    const savedPlan = createQAPlan(plan); 
 
    res.status(201).json({ 
      message: "QA plan saved successfully.", 
      plan: savedPlan 
    }); 
 
  } catch (error) { 
    console.error("Save QA plan error:", error); 
 
    res.status(500).json({ 
      error: "Failed to save QA plan." 
    }); 
  } 
}); 
app.get("/api/qa-plans", (req, res) => { 
  try { 
    const plans = getQAPlans(); 
 
    res.json({ 
      plans 
    }); 
 
  } catch (error) { 
    console.error("Get QA plans error:", error); 
 
    res.status(500).json({ 
      error: "Failed to retrieve QA plans." 
    }); 
  } 
}); 
app.get("/api/qa-plans/latest", (req, res) => { 
  try { 
    const plans = getQAPlans(); 
 
    if (!plans || plans.length === 0) { 
      return res.status(404).json({ 
        error: "No saved QA plans found." 
      }); 
    } 
 
    const latestPlan = [...plans].sort( 
      (a, b) => { 
        if (a.id === b.id) { 
          return Number(b.version) - Number(a.version); 
        } 
 
        return ( 
          new Date(b.updatedAt || b.createdAt) - 
          new Date(a.updatedAt || a.createdAt) 
        ); 
      } 
    )[0]; 
 
    res.json({ 
      plan: latestPlan 
    }); 
 
  } catch (error) { 
    console.error( 
      "Load latest QA plan error:", 
      error 
    ); 
 
    res.status(500).json({ 
      error: "Failed to load saved QA plan." 
    }); 
  } 
}); 
app.post("/api/qa-plans/:id/versions", (req, res) => { 
  try { 
    const planId = req.params.id; 
    const updatedPlan = req.body; 
 
    if (!updatedPlan) { 
      return res.status(400).json({ 
        error: "Updated QA plan is required." 
      }); 
    } 
 
    const newVersion = createQAVersion( 
      planId, 
      updatedPlan 
    ); 
 
    res.status(201).json({ 
      message: "QA plan version created successfully.", 
      plan: newVersion 
    }); 
 
  } catch (error) { 
    console.error( 
      "Create QA plan version error:", 
      error 
    ); 
 
    if ( 
      error.message.includes( 
        "was not found" 
      ) 
    ) { 
      return res.status(404).json({ 
        error: error.message 
      }); 
    } 
 
    res.status(500).json({ 
      error: "Failed to create QA plan version." 
    }); 
  } 
}); 
app.get("/api/qa-plans/:id/versions", (req, res) => { 
  try { 
    const versions = getQAVersions( 
      req.params.id 
    ); 
 
    if (versions.length === 0) { 
      return res.status(404).json({ 
        error: "QA plan not found." 
      }); 
    } 
 
    res.json({ 
      planId: req.params.id, 
      versions 
    }); 
 
  } catch (error) { 
    console.error( 
      "Get QA plan versions error:", 
      error 
    ); 
 
    res.status(500).json({ 
      error: "Failed to retrieve QA plan versions." 
    }); 
  } 
}); 
const PORT = process.env.PORT || 5000; 
 
app.listen(PORT, "0.0.0.0", () => { 
  console.log(`Server running on http://localhost:${PORT}`); 
});

