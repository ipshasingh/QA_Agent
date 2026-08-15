const exampleTestCase = {
  id: "TC-001",

  title: "Successful Google login",

  type: "e2e",

  framework: "Playwright",

  priority: "critical",

  preconditions: [
    "User has a valid Google account"
  ],

  steps: [
    "Open the login page",
    "Click the Continue with Google button",
    "Authenticate using valid Google credentials"
  ],

  expectedResult:
    "The user is successfully authenticated and redirected to the dashboard.",

  acceptanceCriteriaIds: [
    "AC-001",
    "AC-002"
  ],

  rationale:
    "This verifies the primary authentication flow and confirms that successful authentication results in the expected navigation.",

  status: "proposed"
};

module.exports = exampleTestCase;