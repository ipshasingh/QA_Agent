import { useState } from "react";
import "./App.css";

function App() {
  const [requirement, setRequirement] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [implementationSummary, setImplementationSummary] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qaPlan, setQaPlan] = useState(null);

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