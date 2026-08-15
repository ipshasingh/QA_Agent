const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
  __dirname,
  "..",
  "qa-plans.json"
);

function readPlans() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const data = fs.readFileSync(
    DATA_FILE,
    "utf-8"
  );

  if (!data.trim()) {
    return [];
  }

  return JSON.parse(data);
}

function savePlans(plans) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(plans, null, 2),
    "utf-8"
  );
}

function createQAPlan(plan) {
  const plans = readPlans();

  const newPlan = {
    id: `QA-${Date.now()}`,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...plan
  };

  plans.push(newPlan);

  savePlans(plans);

  return newPlan;
}

function createQAVersion(planId, updatedPlan) {
  const plans = readPlans();

  const existingVersions = plans.filter(
    (plan) => plan.id === planId
  );

  if (existingVersions.length === 0) {
    throw new Error(
      `QA plan ${planId} was not found.`
    );
  }

  const latestVersion = Math.max(
    ...existingVersions.map(
      (plan) => Number(plan.version) || 1
    )
  );

  const originalPlan = existingVersions[0];

  const newVersion = {
    ...updatedPlan,

    id: planId,

    version: latestVersion + 1,

    createdAt:
      originalPlan.createdAt,

    updatedAt:
      new Date().toISOString()
  };

  plans.push(newVersion);

  savePlans(plans);

  return newVersion;
}

function getQAPlans() {
  return readPlans();
}

function getQAVersions(planId) {
  const plans = readPlans();

  return plans
    .filter((plan) => plan.id === planId)
    .sort(
      (a, b) =>
        Number(b.version) -
        Number(a.version)
    );
}

module.exports = {
  createQAPlan,
  createQAVersion,
  getQAPlans,
  getQAVersions
};