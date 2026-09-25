"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

type Dataset = {
  id: string;
  name: string;
  system: string;
  version: string;
  case_count: number;
  created_at?: string;
};

type EvaluationResult = {
  dataset_id?: string;
  dataset_name?: string;
  system?: string;
  version?: string;
  total_cases?: number;
  passed_cases?: number;
  failed_cases?: number;
  average_score?: number | null;
  results?: unknown[];
};

const API_BASE_URL = "http://127.0.0.1:8000";

const evaluators = [
  "contains_answer",
  "required_fields",
  "llm_judge",
];

function EvaluationsContent() {
  const searchParams = useSearchParams();

  const requestedDataset = searchParams.get("dataset");

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(
    null
  );

  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/datasets`
        );

        if (!response.ok) {
          throw new Error(
            `Dataset API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          setDatasets([]);
          return;
        }

        const datasetList = data as Dataset[];

        setDatasets(datasetList);

        if (
          requestedDataset &&
          datasetList.some(
            (dataset) => dataset.id === requestedDataset
          )
        ) {
          setSelectedDataset(requestedDataset);
        } else if (datasetList.length > 0) {
          setSelectedDataset(datasetList[0].id);
        }
      } catch (err) {
        console.error("Dataset loading error:", err);

        setError(
          "Cannot connect to the evaluation backend. Make sure port 8000 is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDatasets();
  }, [requestedDataset]);

  const selected = useMemo(() => {
    return datasets.find(
      (dataset) => dataset.id === selectedDataset
    );
  }, [datasets, selectedDataset]);

  async function runEvaluation() {
    if (!selectedDataset) {
      return;
    }

    try {
      setRunning(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/datasets/${encodeURIComponent(
          selectedDataset
        )}/run-system`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            evaluators,
          }),
        }
      );

      if (!response.ok) {
        const detail = await response.text();

        throw new Error(detail);
      }

      const data =
        (await response.json()) as EvaluationResult;

      setResult(data);
    } catch (err) {
      console.error("Evaluation error:", err);

      setError(
        "Evaluation could not be completed. Check that the registered AI system is running."
      );
    } finally {
      setRunning(false);
    }
  }

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
              className="nav-item active"
            >
              <span className="nav-icon">
                ▤
              </span>

              Evaluations
            </Link>

            <Link
              href="/datasets"
              className="nav-item"
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
              Evaluation workspace
            </p>

            <h1>
              Run Evaluation
            </h1>

            <p className="page-description">
              Select a golden dataset and evaluate its
              registered AI system using the configured
              evaluators.
            </p>
          </div>

          <div className="top-actions">
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              API Docs ↗
            </a>
          </div>
        </header>

        <section className="evaluator-grid">
          <article className="evaluator-card">
            <div className="summary-icon">
              ✓
            </div>

            <div>
              <p>
                Deterministic
              </p>

              <strong>
                Contains Answer
              </strong>

              <span>
                Checks expected answer presence
              </span>
            </div>
          </article>

          <article className="evaluator-card">
            <div className="summary-icon">
              ▤
            </div>

            <div>
              <p>
                Structure
              </p>

              <strong>
                Required Fields
              </strong>

              <span>
                Validates required response fields
              </span>
            </div>
          </article>

          <article className="evaluator-card">
            <div className="summary-icon">
              ✦
            </div>

            <div>
              <p>
                Semantic
              </p>

              <strong>
                LLM Judge
              </strong>

              <span>
                Evaluates answer quality
              </span>
            </div>
          </article>
        </section>

        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Evaluation Configuration
              </h2>

              <p>
                Choose the dataset you want to run.
              </p>
            </div>

            <span className="panel-chip">
              {evaluators.length} evaluators
            </span>
          </div>

          {error && (
            <div className="evaluation-alert error-alert">
              <strong>
                Evaluation notice
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          <div className="evaluation-form">
            <label className="form-label">
              Dataset
            </label>

            {loading ? (
              <div className="loading-box">
                Loading datasets...
              </div>
            ) : datasets.length === 0 ? (
              <div className="loading-box">
                No datasets available.
              </div>
            ) : (
              <select
                className="evaluation-select"
                value={selectedDataset}
                onChange={(event) => {
                  setSelectedDataset(
                    event.target.value
                  );

                  setResult(null);
                  setError("");
                }}
              >
                {datasets.map((dataset) => (
                  <option
                    key={dataset.id}
                    value={dataset.id}
                  >
                    {dataset.name} · {dataset.system}
                  </option>
                ))}
              </select>
            )}

            {selected && (
              <div className="selected-dataset">
                <div>
                  <span>
                    Dataset
                  </span>

                  <strong>
                    {selected.name}
                  </strong>
                </div>

                <div>
                  <span>
                    System
                  </span>

                  <strong>
                    {selected.system}
                  </strong>
                </div>

                <div>
                  <span>
                    Version
                  </span>

                  <strong>
                    {selected.version}
                  </strong>
                </div>

                <div>
                  <span>
                    Cases
                  </span>

                  <strong>
                    {selected.case_count ?? 0}
                  </strong>
                </div>
              </div>
            )}

            <div className="evaluation-evaluators">
              {evaluators.map((evaluator) => (
                <span
                  key={evaluator}
                  className="evaluator-pill"
                >
                  ✓{" "}
                  {evaluator.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="primary-button evaluation-run-button"
              onClick={runEvaluation}
              disabled={
                running ||
                loading ||
                !selectedDataset
              }
            >
              {running
                ? "Running Evaluation..."
                : "▶ Run Evaluation"}
            </button>
          </div>
        </section>

        {result && (
          <section className="content-panel evaluation-result-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Evaluation Result
                </h2>

                <p>
                  Latest evaluation run summary.
                </p>
              </div>

              <span className="success-chip">
                Completed
              </span>
            </div>

            <div className="result-stats">
              <div>
                <span>
                  Total Cases
                </span>

                <strong>
                  {result.total_cases ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Passed
                </span>

                <strong>
                  {result.passed_cases ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Failed
                </span>

                <strong>
                  {result.failed_cases ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Average Score
                </span>

                <strong>
                  {typeof result.average_score ===
                  "number"
                    ? `${(
                        result.average_score *
                        100
                      ).toFixed(1)}%`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="result-footer">
              <div>
                <span>
                  Dataset
                </span>

                <strong>
                  {result.dataset_name ??
                    selected?.name ??
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  System
                </span>

                <strong>
                  {result.system ??
                    selected?.system ??
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Version
                </span>

                <strong>
                  {result.version ??
                    selected?.version ??
                    "—"}
                </strong>
              </div>

              <Link
                href="/history"
                className="secondary-button"
              >
                View History →
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function EvaluationsLoading() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-mark">
              ◒
            </div>

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

            <div className="nav-item active">
              <span className="nav-icon">
                ▤
              </span>
              Evaluations
            </div>

            <Link
              href="/datasets"
              className="nav-item"
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
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              Evaluation workspace
            </p>

            <h1>
              Run Evaluation
            </h1>

            <p className="page-description">
              Loading evaluation workspace...
            </p>
          </div>
        </header>

        <section className="content-panel">
          <div className="loading-box">
            Loading datasets...
          </div>
        </section>
      </main>
    </div>
  );
}

export default function EvaluationsPage() {
  return (
    <Suspense fallback={<EvaluationsLoading />}>
      <EvaluationsContent />
    </Suspense>
  );
}