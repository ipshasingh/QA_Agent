const { calculateCoverage } = require("./coverage");
const { validateTests } = require("./testValidation");
const { detectDuplicates } = require("./duplicateDetection");

function validateQAPlan(acceptanceCriteria, tests) {
  const coverage = calculateCoverage(
    acceptanceCriteria,
    tests
  );

  const testValidation = validateTests(tests);

  const duplicateDetection = detectDuplicates(tests);

  const issues = [];

  // Uncovered acceptance criteria
  coverage.uncoveredCriteria.forEach((criteriaId) => {
    issues.push({
      type: "uncovered_criteria",
      severity: "high",
      message: `${criteriaId} has no proposed test.`
    });
  });

  // Invalid acceptance-criteria mappings
  coverage.invalidMappings.forEach((mapping) => {
    issues.push({
      type: "invalid_mapping",
      severity: "medium",
      message:
        `${mapping.testId} references non-existent ` +
        `${mapping.acceptanceCriteriaId}.`
    });
  });

  // Incomplete tests
  testValidation.incompleteTests.forEach((test) => {
    issues.push({
      type: "incomplete_test",
      severity: "medium",
      testId: test.testId,
      message:
        `${test.testId} is missing required fields: ` +
        `${test.missingFields.join(", ")}.`
    });
  });

  // Potential duplicates
  duplicateDetection.duplicates.forEach((duplicate) => {
    issues.push({
      type: "potential_duplicate",
      severity: "low",
      testIds: duplicate.testIds,
      message: duplicate.reason
    });
  });

  return {
    coverage,

    validation: {
      incompleteTests:
        testValidation.incompleteTests,
      incompleteCount:
        testValidation.incompleteCount
    },

    duplicates: duplicateDetection,

    issues
  };
}

module.exports = {
  validateQAPlan
};