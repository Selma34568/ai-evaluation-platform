import Link from "next/link";

export const dynamic = "force-dynamic";

type Dataset = {
  id: string;
  name: string;
  system: string;
  version: string;
  case_count: number;
  created_at?: string;
  description?: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

async function getDatasets(): Promise<Dataset[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/datasets`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Dataset API returned ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data as Dataset[];
  } catch (error) {
    console.error("Datasets fetch error:", error);
    return [];
  }
}

export default async function DatasetsPage() {
  const datasets = await getDatasets();

  const totalCases = datasets.reduce(
    (sum, dataset) =>
      sum + (dataset.case_count ?? 0),
    0
  );

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
              <span className="nav-icon">
                ⌂
              </span>
              Dashboard
            </Link>

            <Link
              href="/evaluations"
              className="nav-item"
            >
              <span className="nav-icon">
                ▤
              </span>
              Evaluations
            </Link>

            <Link
              href="/datasets"
              className="nav-item active"
            >
              <span className="nav-icon">
                ◫
              </span>
              Datasets
            </Link>

            <Link
              href="/history"
              className="nav-item"
            >
              <span className="nav-icon">
                ◷
              </span>
              History
            </Link>
          </nav>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-leaf">
            ❧
          </div>

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
              Evaluation data
            </p>

            <h1>Datasets</h1>

            <p className="page-description">
              Manage golden evaluation datasets
              and inspect the test cases used to
              measure your AI systems.
            </p>
          </div>

          <div className="top-actions">
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Open API ↗
            </a>
          </div>
        </header>

        <section className="dataset-summary-grid">
          <article className="summary-card">
            <div className="summary-icon">
              ◫
            </div>

            <div>
              <p>Total Datasets</p>

              <strong>
                {datasets.length}
              </strong>

              <span>
                Versioned evaluation datasets
              </span>
            </div>
          </article>

          <article className="summary-card">
            <div className="summary-icon">
              ◇
            </div>

            <div>
              <p>Total Test Cases</p>

              <strong>
                {totalCases}
              </strong>

              <span>
                Cases across all datasets
              </span>
            </div>
          </article>
        </section>

        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <h2>Available Datasets</h2>

              <p>
                Evaluation collections registered
                in EvalAI.
              </p>
            </div>

            <span className="panel-chip">
              {datasets.length}{" "}
              {datasets.length === 1
                ? "dataset"
                : "datasets"}
            </span>
          </div>

          {datasets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ◫
              </div>

              <h3>
                No datasets available
              </h3>

              <p>
                No evaluation datasets were
                returned by the backend.
              </p>

              <a
                href={`${API_BASE_URL}/docs`}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                View API
              </a>
            </div>
          ) : (
            <div className="dataset-list">
              {datasets.map((dataset) => (
                <article
                  className="dataset-card"
                  key={dataset.id}
                >
                  <div className="dataset-card-top">
                    <div className="dataset-title-group">
                      <div className="dataset-icon">
                        ◫
                      </div>

                      <div>
                        <h3>
                          {dataset.name}
                        </h3>

                        <div className="dataset-meta">
                          <span>
                            {dataset.system}
                          </span>

                          <span className="meta-dot">
                            •
                          </span>

                          <span>
                            {dataset.version}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="case-badge">
                      {dataset.case_count}{" "}
                      {dataset.case_count === 1
                        ? "Case"
                        : "Cases"}
                    </span>
                  </div>

                  <p className="dataset-description">
                    {dataset.description ??
                      "Evaluation dataset used to test system quality, reliability and robustness."}
                  </p>

                  <div className="dataset-details">
                    <div>
                      <span>
                        Dataset ID
                      </span>

                      <strong>
                        {dataset.id}
                      </strong>
                    </div>

                    <div>
                      <span>
                        AI System
                      </span>

                      <strong>
                        {dataset.system}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Version
                      </span>

                      <strong>
                        {dataset.version}
                      </strong>
                    </div>
                  </div>

                  <div className="dataset-actions">
                    <Link
                      href={`/evaluations?dataset=${encodeURIComponent(
                        dataset.id
                      )}`}
                      className="primary-button small-button"
                    >
                      ▶ Run Evaluation
                    </Link>

                    <a
                      href={`${API_BASE_URL}/datasets/${encodeURIComponent(
                        dataset.id
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-button"
                    >
                      View Dataset ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}