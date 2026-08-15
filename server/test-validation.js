const {
  validateTests
} = require("./utils/testValidation");

const tests = [
  {
    id: "TC-001",
    title: "Successful Google login",
    type: "playwright",
    priority: "high",

    steps: [
      "Open login page",
      "Click Google login",
      "Authenticate with valid credentials"
    ],

    expectedResult:
      "User is redirected to the dashboard.",

    acceptanceCriteriaIds: [
      "AC-001"
    ]
  },

  {
    id: "TC-002",
    title: "Failed Google login",
    type: "playwright",
    priority: "high",

    steps: [],

    expectedResult: "",

    acceptanceCriteriaIds: []
  }
];

const result = validateTests(tests);

console.log(JSON.stringify(result, null, 2));