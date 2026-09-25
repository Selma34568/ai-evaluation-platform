import Link from "next/link";

type EvaluationSummary = {
  dataset_id?: string;
  dataset_name?: string;
  system?: string;
  version?: string;
  total_cases?: number;
  passed_cases?: number;
  failed_cases?: number;
  average_score?: number;
};

type HistoryEntry = {
  id?: string;
  created_at?: string;
  mode?: string;
  result?: EvaluationSummary;
};

async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/datasets/history",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Could not fetch evaluation history."
      );
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.history)) {
      return data.history;
    }

    if (Array.isArray(data.runs)) {
      return data.runs;
    }

    return [];
  } catch (error) {
    console.error(
      "History fetch error:",
      error
    );

    return [];
  }
}

function formatScore(score?: number) {
  if (typeof score !== "number") {
    return "—";
  }

  return `${(score * 100).toFixed(1)}%`;
}

function formatDate(date?: string) {
  if (!date) return "Unknown date";

  try {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  } catch {
    return date;
  }
}

export default async function HistoryPage() {
  const history = await getHistory();

  const totalCases = history.reduce(
    (sum, item) =>
      sum + (item.result?.total_cases ?? 0),
    0
  );

  const passedCases = history.reduce(
    (sum, item) =>
      sum + (item.result?.passed_cases ?? 0),
    0
  );

  const failedCases = history.reduce(
    (sum, item) =>
      sum + (item.result?.failed_cases ?? 0),
    0
  );

  const passRate =
    totalCases > 0
      ? (passedCases / totalCases) * 100
      : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">◒</div>

            <div>
              <div className="brand-name">
                EvalAI
              </div>

              <div className="brand-subtitle">
                AI Evaluation Platform
              </div>
            </div>
          </div>

          <nav className="nav">
            <Link
              href="/"
              className="nav-item"
            >
              <span className="nav-icon">⌂</span>
              Dashboard
            </Link>

            <Link
              href="/evaluations"
              className="nav-item"
            >
              <span className="nav-icon">▤</span>
              Evaluations
            </Link>

            <Link
              href="/datasets"
              className="nav-item"
            >
              <span className="nav-icon">◫</span>
              Datasets
            </Link>

            <Link
              href="/history"
              className="nav-item active"
            >
              <span className="nav-icon">◷</span>
              History
            </Link>
          </nav>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-leaf">❧</div>

          <p>
            Build better AI
            <br />
            with reliable
            <br />
            evaluations.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              Evaluation activity
            </p>

            <h1>Evaluation History</h1>

            <p className="page-description">
              Review previous evaluation runs,
              compare results and inspect system
              quality over time.
            </p>
          </div>

          <div className="top-actions">
            <Link
              href="/evaluations"
              className="primary-button"
            >
              ▶ New Evaluation
            </Link>
          </div>
        </header>

        <section className="history-summary-grid">
          <article className="history-stat-card">
            <span>Evaluation Runs</span>
            <strong>{history.length}</strong>
            <small>Recorded experiments</small>
          </article>

          <article className="history-stat-card">
            <span>Total Cases</span>
            <strong>{totalCases}</strong>
            <small>Evaluated test cases</small>
          </article>

          <article className="history-stat-card">
            <span>Passed</span>
            <strong>{passedCases}</strong>
            <small>
              Successful evaluation cases
            </small>
          </article>

          <article className="history-stat-card">
            <span>Pass Rate</span>
            <strong>
              {passRate.toFixed(1)}%
            </strong>
            <small>Overall success rate</small>
          </article>
        </section>

        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <h2>Previous Evaluations</h2>

              <p>
                Most recent evaluation activity.
              </p>
            </div>

            <span className="panel-chip">
              {history.length} runs
            </span>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ◷
              </div>

              <h3>No evaluation history</h3>

              <p>
                Run an evaluation to create the
                first history entry.
              </p>

              <Link
                href="/evaluations"
                className="primary-button"
              >
                Run Evaluation
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {[...history]
                .reverse()
                .map((entry, index) => {
                  const result =
                    entry.result ?? {};

                  const total =
                    result.total_cases ?? 0;

                  const passed =
                    result.passed_cases ?? 0;

                  const failed =
                    result.failed_cases ?? 0;

                  const localPassRate =
                    total > 0
                      ? (passed / total) * 100
                      : 0;

                  return (
                    <article
                      className="history-card"
                      key={
                        entry.id ??
                        `${entry.created_at}-${index}`
                      }
                    >
                      <div className="history-card-header">
                        <div>
                          <div className="history-title-row">
                            <h3>
                              {result.dataset_name ??
                                "Evaluation Run"}
                            </h3>

                            <span
                              className={
                                failed === 0
                                  ? "run-status passed"
                                  : "run-status mixed"
                              }
                            >
                              {failed === 0
                                ? "Passed"
                                : `${failed} Failed`}
                            </span>
                          </div>

                          <p>
                            {formatDate(
                              entry.created_at
                            )}
                          </p>
                        </div>

                        <div className="history-score">
                          <span>
                            Average Score
                          </span>

                          <strong>
                            {formatScore(
                              result.average_score
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="history-metrics">
                        <div>
                          <span>System</span>
                          <strong>
                            {result.system ??
                              "Unknown"}
                          </strong>
                        </div>

                        <div>
                          <span>Version</span>
                          <strong>
                            {result.version ??
                              "v1"}
                          </strong>
                        </div>

                        <div>
                          <span>Cases</span>
                          <strong>
                            {total}
                          </strong>
                        </div>

                        <div>
                          <span>Passed</span>
                          <strong>
                            {passed}
                          </strong>
                        </div>

                        <div>
                          <span>Failed</span>
                          <strong>
                            {failed}
                          </strong>
                        </div>

                        <div>
                          <span>Pass Rate</span>
                          <strong>
                            {localPassRate.toFixed(
                              1
                            )}
                            %
                          </strong>
                        </div>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-value"
                          style={{
                            width: `${Math.min(
                              100,
                              localPassRate
                            )}%`,
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}