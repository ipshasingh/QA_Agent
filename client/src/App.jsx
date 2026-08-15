import { useState } from "react";
import "./App.css";

function App() {
  const [requirement, setRequirement] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [implementationSummary, setImplementationSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qaPlan, setQaPlan] = useState(null);
  const [reviewedTests, setReviewedTests] = useState({});
  const [editingTestId, setEditingTestId] = useState(null);

  const handleGenerate = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !requirement.trim() ||
      !acceptanceCriteria.trim() ||
      !implementationSummary.trim()
    ) {
      setError("Please fill in all three fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/qa-plan",
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
          data.error || "Failed to generate QA plan."
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
    [testId]: {
      ...previous[testId],
      status: "approved",
    },
  }));
};

const handleReject = (testId) => {
  setReviewedTests((previous) => ({
    ...previous,
    [testId]: {
      ...previous[testId],
      status: "rejected",
    },
  }));
};

const handleEdit = (test) => {
  setEditingTestId(test.id);

  setReviewedTests((previous) => ({
    ...previous,
    [test.id]: {
      ...previous[test.id],
      editedTest: {
        ...test,
      },
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

const handleSaveEdit = (testId) => {
  setEditingTestId(null);
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

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">AI-POWERED QA</p>

          <h1>QA Planning Assistant</h1>

          <p className="subtitle">
            Turn product requirements into structured,
            reviewable test plans.
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

          <button
            className="generate-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Generating QA Plan..."
              : "Generate QA Plan"}
          </button>
        </form>
        {qaPlan && (
  <section className="results-section">
    <div className="results-header">
      <p className="eyebrow">GENERATED QA PLAN</p>

      <h2>QA Analysis Results</h2>

      <p>
        Review the proposed tests and validation results
        before approving anything.
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
          Tests missing required information
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
      const reviewStatus = review.status || "proposed";

      return (
        <article
          className={`test-card ${reviewStatus}`}
          key={test.id}
        >
          <div className="test-card-header">
            <div>
              <span className="test-id">{test.id}</span>

              {isEditing ? (
                <input
                  className="edit-input"
                  value={displayTest.title || ""}
                  onChange={(event) =>
                    handleEditedFieldChange(
                      test.id,
                      "title",
                      event.target.value
                    )
                  }
                />
              ) : (
                <h4>{displayTest.title}</h4>
              )}
            </div>

            <span className={`test-status ${reviewStatus}`}>
              {reviewStatus}
            </span>
          </div>

          <div className="test-meta">
            <span className="test-type">
              {displayTest.type}
            </span>

            {displayTest.framework && (
              <span>{displayTest.framework}</span>
            )}

            {isEditing ? (
              <select
                className="priority-select"
                value={displayTest.priority || "medium"}
                onChange={(event) =>
                  handleEditedFieldChange(
                    test.id,
                    "priority",
                    event.target.value
                  )
                }
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            ) : (
              <span
                className={`test-priority ${displayTest.priority}`}
              >
                {displayTest.priority}
              </span>
            )}
          </div>

          {displayTest.preconditions?.length > 0 && (
            <div className="test-detail">
              <h5>Preconditions</h5>

              <ul>
                {displayTest.preconditions.map(
                  (condition, index) => (
                    <li key={index}>{condition}</li>
                  )
                )}
              </ul>
            </div>
          )}

          <div className="test-detail">
            <h5>Acceptance Criteria</h5>

            <div className="criteria-tags">
              {displayTest.acceptanceCriteriaIds?.map(
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

          <div className="test-detail">
            <h5>Steps</h5>

            {isEditing ? (
              <textarea
                className="edit-textarea steps-editor"
                value={displayTest.steps?.join("\n") || ""}
                onChange={(event) =>
                  handleEditedFieldChange(
                    test.id,
                    "steps",
                    event.target.value.split("\n")
                  )
                }
                placeholder="Enter one test step per line"
              />
            ) : (
              <ol>
                {displayTest.steps?.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            )}
          </div>

          <div className="test-detail">
            <h5>Expected Result</h5>

            {isEditing ? (
              <textarea
                className="edit-textarea"
                value={displayTest.expectedResult || ""}
                onChange={(event) =>
                  handleEditedFieldChange(
                    test.id,
                    "expectedResult",
                    event.target.value
                  )
                }
              />
            ) : (
              <p>{displayTest.expectedResult}</p>
            )}
          </div>

          <div className="test-detail">
            <h5>Why this test?</h5>

            {isEditing ? (
              <textarea
                className="edit-textarea"
                value={displayTest.rationale || ""}
                onChange={(event) =>
                  handleEditedFieldChange(
                    test.id,
                    "rationale",
                    event.target.value
                  )
                }
              />
            ) : (
              <p>{displayTest.rationale}</p>
            )}
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

              {isEditing ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="approve-button"
                    onClick={() => handleApprove(test.id)}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="reject-button"
                    onClick={() => handleReject(test.id)}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      );
    })}
  </div>
</div>
    <div className="issues-section">
      <h3>Validation Results</h3>

      {qaPlan.issues?.length === 0 ? (
        <div className="no-issues">
          ✓ No validation issues detected.
        </div>
      ) : (
        <div className="issue-list">
          {qaPlan.issues.map((issue, index) => (
            <div
              className={`issue-item ${issue.severity}`}
              key={index}
            >
              <strong>
                {issue.type.replaceAll("_", " ")}
              </strong>

              <span>
                {issue.message}
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