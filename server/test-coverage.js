const {
  calculateCoverage
} = require("./utils/coverage");

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
    acceptanceCriteriaIds: ["AC-001", "AC-002"]
  },
  {
  id: "TC-002",
  acceptanceCriteriaIds: ["AC-003", "AC-999"]
}
];

const result = calculateCoverage(
  acceptanceCriteria,
  tests
);

console.log(JSON.stringify(result, null, 2));