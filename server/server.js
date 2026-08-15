const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "QA Planning Assistant API is running!",
  });
});

app.post("/api/test-ai", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Explain what a software test case is in one sentence.",
    });

    res.json({
      result: response.text,
    });
  } catch (error) {
    console.error("Gemini error:");
    console.error("Status:", error.status);
    console.error("Message:", error.message);

    res.status(500).json({
      error: error.message || "Failed to connect to Gemini",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});