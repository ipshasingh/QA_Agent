const {
  retrieveRelevantGuidance
} = require("./services/knowledgeService");

const result = retrieveRelevantGuidance(
  "Added Google OAuth login and protected API endpoints."
);

console.log(JSON.stringify(result, null, 2));