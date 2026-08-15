const {
  validateQAPlan
} = require("./utils/qaValidator");

const acceptanceCriteria = [
  {
    id: "AC-001",
    text: "User can initiate Google login."
  },
  {
    id: "AC-002",
    text: "Successful authentication redirects to dashboard."
  },
  {
    id: "AC-003",
    text: "Authentication failure displays an error."
  },
  {
    id: "AC-004",
    text: "Existing users are associated with their account."
  }
];

const tests = [
  {
    id: "TC-001",
    title: "Successful Google login",
    type: "playwright",
    priority: "high",

    steps: [
      "Open the login page",
      "Click Google login",
      "Authenticate with valid credentials"
    ],

    expectedResult:
      "User is redirected to the dashboard.",

    acceptanceCriteriaIds: [
      "AC-001",
      "AC-002"
    ]
  },

  {
    id: "TC-002",
    title: "Successfully login with Google",
    type: "playwright",
    priority: "high",

    steps: [
      "Open the login page",
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
    id: "TC-003",
    title: "Failed Google login",
    type: "playwright",
    priority: "high",

    steps: [],

    expectedResult: "",

    acceptanceCriteriaIds: []
  },

  {
    id: "TC-004",
    title: "Invalid acceptance criteria reference",
    type: "api",
    priority: "medium",

    steps: [
      "Send an authentication request"
    ],

    expectedResult:
      "Authentication error is returned.",

    acceptanceCriteriaIds: [
      "AC-003",
      "AC-999"
    ]
  }
];

const result = validateQAPlan(
  acceptanceCriteria,
  tests
);

console.log(
  JSON.stringify(result, null, 2)
);