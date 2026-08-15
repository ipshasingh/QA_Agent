const exampleAnalysis = {
  userFlows: [
    {
      id: "FLOW-001",
      name: "Google authentication",
      description:
        "User starts Google authentication, completes authentication, and reaches the dashboard."
    }
  ],

  assumptions: [
    {
      text:
        "Existing accounts are matched using the user's verified email address.",
      impact:
        "The account-linking behavior should be confirmed before finalizing the QA plan."
    }
  ],

  risks: [
    {
      area: "OAuth callback handling",
      level: "high",
      reason:
        "Invalid or expired callbacks could cause authentication failures or incorrect session creation."
    }
  ],

  regressionAreas: [
    "Existing email/password login",
    "Protected routes",
    "Session handling"
  ]
};

module.exports = exampleAnalysis;