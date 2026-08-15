const fs = require("fs");
const path = require("path");

const knowledgeDirectory = path.join(__dirname, "..", "knowledge");

function loadKnowledgeBase() {
  const files = fs
    .readdirSync(knowledgeDirectory)
    .filter((file) => file.endsWith(".md"));

  return files.map((file) => {
    const filePath = path.join(knowledgeDirectory, file);

    return {
      file,
      content: fs.readFileSync(filePath, "utf-8")
    };
  });
}

function retrieveRelevantGuidance(text) {
  const query = text.toLowerCase();

  const knowledgeBase = loadKnowledgeBase();

  const topicKeywords = {
    authentication: [
      "authentication",
      "login",
      "logout",
      "oauth",
      "token",
      "session"
    ],

    api: [
      "api",
      "endpoint",
      "request",
      "response",
      "http"
    ],

    browser: [
      "browser",
      "ui",
      "page",
      "form",
      "click",
      "navigation"
    ],

    permission: [
      "permission",
      "authorization",
      "role",
      "admin",
      "access"
    ],

    failure: [
      "failure",
      "error",
      "timeout",
      "network",
      "unavailable"
    ],

    regression: [
      "regression",
      "existing",
      "change",
      "modified"
    ],

    boundary: [
      "boundary",
      "limit",
      "maximum",
      "minimum",
      "range"
    ]
  };

  const matchedTopics = Object.entries(topicKeywords)
    .filter(([, keywords]) =>
      keywords.some((keyword) => query.includes(keyword))
    )
    .map(([topic]) => topic);

  const relevantDocuments = knowledgeBase.filter((document) => {
    const documentText = document.content.toLowerCase();

    return matchedTopics.some((topic) => {
      const keywords = topicKeywords[topic];

      return keywords.some((keyword) =>
        documentText.includes(keyword)
      );
    });
  });

  return {
    matchedTopics,
    documents: relevantDocuments
  };
}

module.exports = {
  loadKnowledgeBase,
  retrieveRelevantGuidance
};