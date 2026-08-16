import { useState } from "react";
import "./App.css";
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [requirement, setRequirement] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [implementationSummary, setImplementationSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qaPlan, setQaPlan] = useState(null);
  const [reviewedTests, setReviewedTests] = useState({});
  const [editingTestId, setEditingTestId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [savedPlanId, setSavedPlanId] = useState(null);
const [savedVersion, setSavedVersion] = useState(null);
const [versions, setVersions] = useState([]);
const [loadingVersions, setLoadingVersions] = useState(false);
  const handleGenerate = async (event) => {
    event.preventDefault();

    setError("");
    setSaveMessage("");
    setSavedPlanId(null);
    setSavedVersion(null);
    setReviewedTests({});
    setEditingTestId(null);
    if (
      !requirement.trim() ||
      !acceptanceCriteria.trim() ||
      !implementationSummary.trim()
    ) {
      setError("All the Fields are empty!!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/qa-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requirement,
            acceptanceCriteria,
            implementationSummary,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate QA plan."
        );
      }

      console.log("QA PLAN:", data);

      setQaPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
const handleApprove = (testId) => {
  setReviewedTests((previous) => ({
    ...previous,
    [testId]: { ...previous[testId], status: "approved" },
  }));
};

const handleReject = (testId) => {
  setReviewedTests((previous) => ({
    ...previous,
    [testId]: { ...previous[testId], status: "rejected" },
  }));
};

const handleEdit = (test) => {
  setEditingTestId(test.id);
  setReviewedTests((previous) => ({
    ...previous,
    [test.id]: {
      ...previous[test.id],
      editedTest: { ...test },
    },
  }));
};

const handleCancelEdit = (testId) => {
  setEditingTestId(null);
  setReviewedTests((previous) => {
    const next = { ...previous };
    if (next[testId]) {
      const { editedTest, ...rest } = next[testId];
      next[testId] = rest;
    }
    return next;
  });
};

const handleEditedFieldChange = (testId, field, value) => {
  setReviewedTests((previous) => ({
    ...previous,
    [testId]: {
      ...previous[testId],
      editedTest: {
        ...previous[testId]?.editedTest,
        [field]: value,
      },
    },
  }));
};

const handleSaveEdit = (testId) => {
  setEditingTestId(null);
};

const buildReviewedPlan = () => ({
  ...qaPlan,
  requirement,
  acceptanceCriteria,
  implementationSummary,
  tests: (qaPlan.tests || []).map((test) => {
    const review = reviewedTests[test.id] || {};
    return {
      ...test,
      ...(review.editedTest || {}),
      status: review.status || test.status || "proposed",
    };
  }),
  review: {
    reviewed: true,
    reviewedAt: new Date().toISOString(),
  },
});

const handleSavePlan = async () => {
  if (!qaPlan) {
    return;
  }

  setError("");
  setSaveMessage("");
  setSaving(true);

  try {
    const reviewedPlan = buildReviewedPlan();

    const isExistingPlan = Boolean(savedPlanId);

    const url = isExistingPlan
      ? `${API_URL}/api/qa-plans/${savedPlanId}/versions`
      : `${API_URL}/api/qa-plans`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewedPlan),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to save this QA plan."
      );
    }

    const savedPlan = data.plan;

    setSavedPlanId(savedPlan.id);
    setSavedVersion(savedPlan.version);

    setSaveMessage(
      `QA plan is saved successfully as ${savedPlan.id}, version ${savedPlan.version}.`
    );

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setSaving(false);
  }
};
const handleLoadLatestPlan = async () => {
  setError("");
  setSaveMessage("");
  setLoadingSavedPlan(true);

  try {
    const response = await fetch(
      `${API_URL}/api/qa-plans/latest`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load the saved QA plan."
      );
    }

    const plan = data.plan;

    setQaPlan(plan);

    setSavedPlanId(plan.id);
    setSavedVersion(plan.version);

    const restoredReviews = {};

    (plan.tests || []).forEach((test) => {
      if (test.status && test.status !== "proposed") {
        restoredReviews[test.id] = {
          status: test.status
        };
      }
    });

    setReviewedTests(restoredReviews);

    setSaveMessage(
      `Loaded ${plan.id}, version ${plan.version}.`
    );

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoadingSavedPlan(false);
  }
};
const handleLoadVersionHistory = async () => {
  if (!savedPlanId) {
    return;
  }

  setLoadingVersions(true);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/api/qa-plans/${savedPlanId}/versions`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to load version history."
      );
    }

    setVersions(data.versions || []);
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoadingVersions(false);
  }
};
  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">AI agent QA</p>

          <h1>QA Planning AI assistant</h1>

          <p className="subtitle">
            Converting product requirements into structured, reviewable test plans.            
          </p>
        </div>
      </header>

      <main className="main">
        <form
          className="qa-form"
          onSubmit={handleGenerate}
        >
          <section className="form-section">
            <label htmlFor="requirement">
              Requirement / User Story
            </label>

            <textarea
              id="requirement"
              value={requirement}
              onChange={(event) =>
                setRequirement(event.target.value)
              }
              placeholder="Example: As a registered user, I want to log in using Google so that I can access my account without entering a password."
              rows="5"
            />
          </section>

          <section className="form-section">
            <label htmlFor="acceptanceCriteria">
              Acceptance Criteria
            </label>

            <textarea
              id="acceptanceCriteria"
              value={acceptanceCriteria}
              onChange={(event) =>
                setAcceptanceCriteria(event.target.value)
              }
              placeholder={`AC-001: User can initiate Google login.
AC-002: Successful authentication redirects to the dashboard.
AC-003: Existing users are associated with their account.
AC-004: Authentication failure displays an error.`}
              rows="7"
            />

            <p className="field-help">
              Add one acceptance criterion per line.
            </p>
          </section>

          <section className="form-section">
            <label htmlFor="implementationSummary">
              Implementation / Change Summary
            </label>

            <textarea
              id="implementationSummary"
              value={implementationSummary}
              onChange={(event) =>
                setImplementationSummary(event.target.value)
              }
              placeholder="Example: Added Google OAuth authentication, callback handling, account lookup and session creation."
              rows="5"
            />
          </section>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {saveMessage && (
            <div className="save-message">
              {saveMessage}
            </div>
          )}

          <button
            className="generate-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating QA Plan..."
              : "Generate QA Plan"}
          </button>
          <button
  type="button"
  className="load-plan-button"
  onClick={handleLoadLatestPlan}
  disabled={loadingSavedPlan}
>
  {loadingSavedPlan
    ? "Loading Saved Plan..."
    : "Load Latest Saved Plan"}
</button>
        </form>
        {qaPlan && (
  <section className="results-section">
    <div className="results-header">
      <p className="eyebrow">GENERATED QA PLAN</p>

      <h2>QA Analysis Results</h2>

      <p>
        Review the proposed tests and validation results prior to approving anything.
      </p>
    </div>

    <div className="summary-grid">

      <div className="summary-card coverage-card">
        <span>Acceptance Criteria Coverage</span>

        <strong>
          {qaPlan.coverage?.coveragePercentage ?? 0}%
        </strong>

        <p>
          {qaPlan.coverage?.coveredCount ?? 0} of{" "}
          {qaPlan.coverage?.totalCriteria ?? 0} criteria covered
        </p>
      </div>

      <div className="summary-card">
        <span>Incomplete Tests</span>

        <strong>
          {qaPlan.validation?.incompleteCount ?? 0}
        </strong>

        <p>
          Required information missing from proposed tests
        </p>
      </div>

      <div className="summary-card">
        <span>Potential Duplicates</span>

        <strong>
          {qaPlan.duplicates?.duplicateCount ?? 0}
        </strong>

        <p>
          Similar test cases detected
        </p>
      </div>

      <div className="summary-card">
        <span>Issues</span>

        <strong>
          {qaPlan.issues?.length ?? 0}
        </strong>

        <p>
          Validation issues requiring review
        </p>
      </div>

    </div>

    <div className="criteria-section">
      <h3>Acceptance Criteria</h3>

      <div className="criteria-list">

        {qaPlan.coverage?.coveredCriteria?.map(
          (criteriaId) => (
            <div
              className="criteria-item covered"
              key={criteriaId}
            >
              <span className="criteria-icon">
                ✓
              </span>

              <span>{criteriaId}</span>

              <span className="criteria-status">
                Covered
              </span>
            </div>
          )
        )}

        {qaPlan.coverage?.uncoveredCriteria?.map(
          (criteriaId) => (
            <div
              className="criteria-item uncovered"
              key={criteriaId}
            >
              <span className="criteria-icon">
                !
              </span>

              <span>{criteriaId}</span>

              <span className="criteria-status">
                Uncovered
              </span>
            </div>
          )
        )}

      </div>
    </div>

    <div className="analysis-section">
  <h3>QA Analysis</h3>

  <div className="analysis-grid">
    <div className="analysis-card">
      <h4>User Flows</h4>

      {qaPlan.analysis?.userFlows?.length > 0 ? (
        <div className="analysis-list">
          {qaPlan.analysis.userFlows.map((flow) => (
            <div className="analysis-item" key={flow.id}>
              <strong>
                {flow.id}: {flow.name}
              </strong>

              <p>{flow.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          No user flows identified.
        </p>
      )}
    </div>

    <div className="analysis-card">
      <h4>Assumptions</h4>

      {qaPlan.analysis?.assumptions?.length > 0 ? (
        <div className="analysis-list">
          {qaPlan.analysis.assumptions.map(
            (assumption, index) => (
              <div
                className="analysis-item"
                key={index}
              >
                <p>{assumption.text}</p>

                {assumption.impact && (
                  <span className="analysis-impact">
                    Impact: {assumption.impact}
                  </span>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <p className="empty-state">
          No assumptions identified.
        </p>
      )}
    </div>

    <div className="analysis-card">
      <h4>Risks</h4>

      {qaPlan.analysis?.risks?.length > 0 ? (
        <div className="analysis-list">
          {qaPlan.analysis.risks.map(
            (risk, index) => (
              <div
                className="analysis-item"
                key={index}
              >
                <div className="risk-header">
                  <strong>{risk.area}</strong>

                  <span
                    className={`risk-level ${risk.level}`}
                  >
                    {risk.level}
                  </span>
                </div>

                <p>{risk.reason}</p>
              </div>
            )
          )}
        </div>
      ) : (
        <p className="empty-state">
          No risks identified.
        </p>
      )}
    </div>

    <div className="analysis-card">
      <h4>Regression Areas</h4>

      {qaPlan.analysis?.regressionAreas?.length > 0 ? (
        <ul className="regression-list">
          {qaPlan.analysis.regressionAreas.map(
            (area, index) => (
              <li key={index}>{area}</li>
            )
          )}
        </ul>
      ) : (
        <p className="empty-state">
          No regression areas identified.
        </p>
      )}
    </div>
  </div>
</div>
<div className="tests-section">
  <div className="tests-header">
    <div>
      <h3>Proposed Test Cases</h3>

      <p>
        AI-generated tests for human review.
      </p>
    </div>

    <span className="test-count">
      {qaPlan.tests?.length ?? 0} tests
    </span>
  </div>

  <div className="test-list">
    {qaPlan.tests?.map((test) => {
      const review = reviewedTests[test.id] || {};
      const displayTest = review.editedTest || test;
      const isEditing = editingTestId === test.id;
      const reviewStatus = review.status || test.status || "proposed";

      return (
      <article
        className="test-card"
        key={test.id}
      >
        <div className="test-card-header">
          <div>
            <span className="test-id">
              {test.id}
            </span>

            <h4>{displayTest.title}</h4>
          </div>

          <span className="test-status">
            {reviewStatus}
          </span>
        </div>

        <div className="test-meta">
          <span className="test-type">
            {displayTest.type}
          </span>

          {test.framework && (
            <span>
              {test.framework}
            </span>
          )}

          <span
            className={`test-priority ${displayTest.priority}`}
          >
            {displayTest.priority}
          </span>
        </div>

        {isEditing && review.editedTest && (
          <div className="test-detail edit-panel">
            <h5>Edit Test</h5>

            <label>Title</label>
            <input
              className="edit-input"
              value={review.editedTest.title || ""}
              onChange={(event) =>
                handleEditedFieldChange(test.id, "title", event.target.value)
              }
            />

            <label>Priority</label>
            <select
              className="priority-select"
              value={review.editedTest.priority || "medium"}
              onChange={(event) =>
                handleEditedFieldChange(test.id, "priority", event.target.value)
              }
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <label>Steps</label>
            <textarea
              className="edit-textarea"
              value={review.editedTest.steps?.join("\n") || ""}
              onChange={(event) =>
                handleEditedFieldChange(test.id, "steps", event.target.value.split("\n"))
              }
            />

            <label>Expected Result</label>
            <textarea
              className="edit-textarea"
              value={review.editedTest.expectedResult || ""}
              onChange={(event) =>
                handleEditedFieldChange(test.id, "expectedResult", event.target.value)
              }
            />

            <label>Rationale</label>
            <textarea
              className="edit-textarea"
              value={review.editedTest.rationale || ""}
              onChange={(event) =>
                handleEditedFieldChange(test.id, "rationale", event.target.value)
              }
            />

            <div className="review-buttons">
              <button
                type="button"
                className="save-button"
                onClick={() => handleSaveEdit(test.id)}
              >
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => handleCancelEdit(test.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {test.preconditions?.length > 0 && (
          <div className="test-detail">
            <h5>Preconditions</h5>

            <ul>
              {test.preconditions.map(
                (condition, index) => (
                  <li key={index}>
                    {condition}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        <div className="test-detail">
          <h5>Acceptance Criteria</h5>

          <div className="criteria-tags">
            {test.acceptanceCriteriaIds?.map(
              (criteriaId) => (
                <span
                  className="criteria-tag"
                  key={criteriaId}
                >
                  ✓ {criteriaId}
                </span>
              )
            )}
          </div>
        </div>

        <div className="review-controls">
          <div className="review-status">
            Review status: <strong>{reviewStatus}</strong>
          </div>

          <div className="review-buttons">
            {!isEditing && (
              <button
                type="button"
                className="edit-button"
                onClick={() => handleEdit(test)}
              >
                Edit
              </button>
            )}

            <button
              type="button"
              className="approve-button"
              onClick={() => handleApprove(test.id)}
              disabled={isEditing}
            >
              Approve
            </button>

            <button
              type="button"
              className="reject-button"
              onClick={() => handleReject(test.id)}
              disabled={isEditing}
            >
              Reject
            </button>
          </div>
        </div>

        <div className="test-detail">
          <h5>Steps</h5>

          <ol>
            {displayTest.steps?.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="test-detail">
          <h5>Expected Result</h5>

          <p>{displayTest.expectedResult}</p>
        </div>

        <div className="test-detail">
          <h5>Why this test?</h5>

          <p>{displayTest.rationale}</p>
        </div>
      </article>
      );
    })}
  </div>
</div>
    <div className="save-plan-section">
  <div>
    <h3>Save Reviewed QA Plan</h3>

    <p>
      Save the current human-reviewed version of this QA plan.
    </p>

    {savedPlanId && (
      <p className="saved-version">
        Current saved version:{" "}
        <strong>v{savedVersion}</strong>
        {" "}·{" "}
        <strong>{savedPlanId}</strong>
      </p>
    )}
  </div>

  <div className="version-history-section">
  <div className="version-history-header">
    <div>
      <h3>Version History</h3>
      <p>
        Previously saved versions of this reviewed QA plan.
      </p>
    </div>

    <button
      type="button"
      className="load-history-button"
      onClick={handleLoadVersionHistory}
      disabled={!savedPlanId || loadingVersions}
    >
      {loadingVersions
        ? "Loading..."
        : "Load Version History"}
    </button>
  </div>

  {versions.length > 0 && (
    <div className="version-list">
      {versions.map((version) => (
        <div
          className={`version-item ${
            version.version === savedVersion
              ? "current-version"
              : ""
          }`}
          key={`${version.id}-${version.version}`}
        >
          <div>
            <strong>
              Version {version.version}
            </strong>

            {version.version === savedVersion && (
              <span className="current-version-label">
                Current
              </span>
            )}
          </div>

          <span>
            {new Date(
              version.updatedAt || version.createdAt
            ).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )}

  {savedPlanId && versions.length === 0 && (
    <p className="empty-state">
      Click "Load Version History" to see saved versions.
    </p>
  )}
</div>

  <button
    type="button"
    className="save-plan-button"
    onClick={handleSavePlan}
    disabled={saving}
  >
    {saving
      ? "Saving QA Plan..."
      : savedPlanId
        ? "Save New Version"
        : "Save QA Plan"}
  </button>
</div>

    <div className="issues-section">
  <h3>Validation Results</h3>

  {(qaPlan.issues ?? []).length === 0 ? (
    <div className="no-issues">
      ✓ No validation issues detected.
    </div>
  ) : (
    <div className="issue-list">
      {(qaPlan.issues ?? []).map((issue, index) => (
        <div
          className={`issue-item ${issue.severity || "medium"}`}
          key={index}
        >
          <strong>
            {(issue.type || "issue").replaceAll("_", " ")}
          </strong>

          <span>
            {issue.message || "Validation issue detected."}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
  </section>
)}
      </main>
    </div>
  );
}

export default App;