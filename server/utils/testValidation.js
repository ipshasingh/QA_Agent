function validateTests(tests) {
  const issues = [];

  const validTypes = [
    "unit",
    "api",
    "integration",
    "e2e",
    "playwright",
    "manual"
  ];

  const validPriorities = [
    "critical",
    "high",
    "medium",
    "low"
  ];

  tests.forEach((test) => {
    const missingFields = [];

    if (!test.title || test.title.trim() === "") {
      missingFields.push("title");
    }

    if (!test.type || !validTypes.includes(test.type)) {
      missingFields.push("valid test type");
    }

    if (!test.priority || !validPriorities.includes(test.priority)) {
      missingFields.push("valid priority");
    }

    if (
      !Array.isArray(test.steps) ||
      test.steps.length === 0
    ) {
      missingFields.push("steps");
    }

    if (
      !test.expectedResult ||
      test.expectedResult.trim() === ""
    ) {
      missingFields.push("expectedResult");
    }

    if (
      !Array.isArray(test.acceptanceCriteriaIds) ||
      test.acceptanceCriteriaIds.length === 0
    ) {
      missingFields.push("acceptanceCriteriaIds");
    }

    if (missingFields.length > 0) {
      issues.push({
        testId: test.id,
        missingFields
      });
    }
  });

  return {
    incompleteTests: issues,
    incompleteCount: issues.length
  };
}

module.exports = {
  validateTests
};