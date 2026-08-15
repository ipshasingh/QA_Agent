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

function getQAPlans() {
  return readPlans();
}

module.exports = {
  createQAPlan,
  getQAPlans
};