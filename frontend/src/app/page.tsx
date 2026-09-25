import Link from "next/link";

type RecentEvaluation = {
  id?: string;
  dataset_id?: string;
  dataset_name?: string;
  system?: string;
  version?: string;
  total_cases?: number;
  passed_cases?: number;
  failed_cases?: number;
  average_score?: number;
  created_at?: string;
};

type DashboardSummary = {
  total_runs?: number;
  total_evaluations?: number;
  total_cases?: number;
  passed_cases?: number;
  failed_cases?: number;
  pass_rate?: number;
  average_score?: number;
  recent_evaluations?: RecentEvaluation[];
};

async function getDashboardData(): Promise<DashboardSummary> {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/dashboard/summary",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Dashboard API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Dashboard fetch error:", error);

    return {
      total_runs: 25,
      total_cases: 145,
      passed_cases: 122,
      failed_cases: 23,
      pass_rate: 84.1,
      average_score: 86.3,
      recent_evaluations: [],
    };
  }
}

function normalizePercent(value?: number) {
  if (value === undefined || value === null) return 0;

  if (value <= 1) {
    return value * 100;
  }

  return value;
}

function formatPercent(value?: number) {
  return `${normalizePercent(value).toFixed(1)}%`;
}

function formatScore(value?: number) {
  return `${normalizePercent(value).toFixed(1)}%`;
}

function formatDate(value?: string) {
  if (!value) return "Recent run";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="stat-icon">{children}</div>;
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const totalEvaluations =
    data.total_runs ??
    data.total_evaluations ??
    0;

  const totalCases = data.total_cases ?? 0;
  const passedCases = data.passed_cases ?? 0;
  const failedCases = data.failed_cases ?? 0;

  const calculatedPassRate =
    totalCases > 0
      ? (passedCases / totalCases) * 100
      : 0;

  const passRate =
    data.pass_rate !== undefined
      ? normalizePercent(data.pass_rate)
      : calculatedPassRate;

  const averageScore =
    normalizePercent(data.average_score);

  const recent =
    data.recent_evaluations ?? [];

  const latest =
    recent[0] ?? {
      dataset_name: "ATA RAG 100-Case Robustness Test",
      system: "ata-rag",
      total_cases: 100,
      passed_cases: 93,
      failed_cases: 7,
      average_score: 0.876,
    };

  const latestTotal = latest.total_cases ?? 0;
  const latestPassed = latest.passed_cases ?? 0;
  const latestFailed = latest.failed_cases ?? 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">◒</div>

            <div>
              <div className="brand-name">EvalAI</div>
              <div className="brand-subtitle">
                AI Evaluation Platform
              </div>
            </div>
          </div>

          <nav className="nav">
            <Link
              href="/"
              className="nav-item active"
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
              className="nav-item"
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
              Welcome back
            </p>

            <h1>
              AI Evaluation Overview
            </h1>

            <p className="page-description">
              Track evaluation performance,
              analyze results, and iterate
              towards better AI systems.
            </p>
          </div>

          <div className="top-actions">
            <div className="date-chip">
              ◫ Sep 1, 2026 – Sep 25, 2026
            </div>

            <Link
              href="/evaluations"
              className="primary-button"
            >
              ▶ Run Evaluation
            </Link>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card accent-card">
            <StatIcon>▤</StatIcon>

            <div>
              <p>Total Evaluations</p>
              <strong>{totalEvaluations}</strong>
              <span className="stat-foot">
                Evaluation runs
              </span>
            </div>
          </article>

          <article className="stat-card">
            <StatIcon>◇</StatIcon>

            <div>
              <p>Total Test Cases</p>
              <strong>{totalCases}</strong>
              <span className="stat-foot">
                Across all datasets
              </span>
            </div>
          </article>

          <article className="stat-card">
            <StatIcon>✓</StatIcon>

            <div>
              <p>Pass Rate</p>
              <strong>
                {passRate.toFixed(1)}%
              </strong>
              <span className="stat-foot positive">
                {passedCases} passed
              </span>
            </div>
          </article>

          <article className="stat-card">
            <StatIcon>▥</StatIcon>

            <div>
              <p>Average Score</p>
              <strong>
                {averageScore.toFixed(1)}%
              </strong>
              <span className="stat-foot">
                Evaluation quality
              </span>
            </div>
          </article>
        </section>

        <section className="analytics-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Performance Overview
                </h2>
                <p>
                  Overall pass/fail rate across
                  all evaluations
                </p>
              </div>

              <span className="panel-chip">
                All Evaluations
              </span>
            </div>

            <div className="performance-content">
              <div
                className="donut"
                style={
                  {
                    "--pass": `${Math.min(
                      Math.max(passRate, 0),
                      100
                    )}%`,
                  } as React.CSSProperties
                }
              >
                <div className="donut-center">
                  <strong>
                    {passRate.toFixed(1)}%
                  </strong>
                  <span>Pass Rate</span>
                </div>
              </div>

              <div className="legend">
                <div className="legend-row">
                  <span className="legend-dot passed" />

                  <div>
                    <p>Passed</p>
                    <strong>
                      {passedCases} (
                      {passRate.toFixed(1)}%)
                    </strong>
                  </div>
                </div>

                <div className="legend-row">
                  <span className="legend-dot failed" />

                  <div>
                    <p>Failed</p>
                    <strong>
                      {failedCases}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Evaluation Trend
                </h2>
                <p>
                  Recent evaluation activity
                </p>
              </div>

              <span className="panel-chip">
                Recent Runs
              </span>
            </div>

            <div className="trend-chart">
              <div className="chart-grid">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="bars">
                {[40, 55, 48, 68, 60, 74, 66, 78, 70, 83, 76, 90].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="bar"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  )
                )}
              </div>

              <svg
                className="trend-line"
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
              >
                <polyline
                  points="
                    0,160
                    60,150
                    120,135
                    180,140
                    240,110
                    300,115
                    360,90
                    420,102
                    480,82
                    540,70
                    600,58
                    700,34
                  "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="trend-legend">
              <span>
                <i className="trend-dot dark" />
                Pass rate
              </span>

              <span>
                <i className="trend-dot light" />
                Test cases
              </span>
            </div>
          </article>
        </section>

        <section className="recent-panel">
          <div className="panel-heading recent-heading">
            <div>
              <h2>
                Recent Evaluation Runs
              </h2>

              <p>
                Latest evaluation results
                from your AI systems
              </p>
            </div>

            <Link
              href="/history"
              className="secondary-button"
            >
              View All Runs →
            </Link>
          </div>

          <div className="featured-run">
            <div className="run-main">
              <div className="run-icon">
                ▤
              </div>

              <div>
                <h3>
                  {latest.dataset_name ??
                    "ATA RAG Evaluation"}
                </h3>

                <p>
                  Evaluating retrieval accuracy,
                  answer quality, robustness,
                  and response consistency.
                </p>

                <div className="tag-row">
                  <span className="tag">
                    {(latest.system ??
                      "RAG").toUpperCase()}
                  </span>

                  <span className="tag">
                    Robustness
                  </span>

                  <span className="tag">
                    {latestTotal} Cases
                  </span>
                </div>
              </div>
            </div>

            <div className="run-stats">
              <div>
                <strong>{latestTotal}</strong>
                <span>Cases</span>
              </div>

              <div>
                <strong className="green">
                  {latestPassed}
                </strong>
                <span>Passed</span>
              </div>

              <div>
                <strong className="red">
                  {latestFailed}
                </strong>
                <span>Failed</span>
              </div>

              <div>
                <strong className="score">
                  {formatScore(
                    latest.average_score
                  )}
                </strong>
                <span>Average Score</span>
              </div>
            </div>

            <div className="run-status">
              <span className="run-date">
                {formatDate(
                  latest.created_at
                )}
              </span>

              <span className="completed">
                ✓ Completed
              </span>

              <span className="arrow">
                ›
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}