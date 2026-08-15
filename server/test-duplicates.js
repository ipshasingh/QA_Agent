const {
  detectDuplicates
} = require("./utils/duplicateDetection");

const tests = [
  {
    id: "TC-001",
    title: "Successful Google login",

    steps: [
      "Open the login page",
      "Click Google login",
      "Authenticate with valid credentials"
    ]
  },

  {
    id: "TC-002",
    title: "Successfully login with Google",

    steps: [
      "Open the login page",
      "Click Google login",
      "Authenticate with valid credentials"
    ]
  },

  {
    id: "TC-003",
    title: "Authentication failure",

    steps: [
      "Open the login page",
      "Enter invalid credentials",
      "Submit the login form"
    ]
  }
];

const result = detectDuplicates(tests);

console.log(JSON.stringify(result, null, 2));