import Link from "next/link";
import { redirect } from "next/navigation";

const API_URL = (
  process.env.API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

type Dataset = {
  id: string;
  name: string;
  system: string;
  version: string;
  case_count: number;
};

type EvaluationResult = {
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  average_score: number | null;
};

const EVALUATORS = [
  "contains_answer",
  "required_fields",
  "llm_judge",
];

async function getDatasets(): Promise<Dataset[]> {
  const response = await fetch(`${API_URL}/datasets`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load datasets.");
  }

  return response.json();
}

async function runEvaluation(formData: FormData) {
  "use server";

  const datasetId = String(
    formData.get("dataset_id") || ""
  );

  if (!datasetId) {
    redirect("/evaluations?error=Missing+dataset+ID");
  }

  let result: EvaluationResult;

  try {
    const response = await fetch(
      `${API_URL}/datasets/${encodeURIComponent(datasetId)}/run-system`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluators: EVALUATORS,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      let message = `Evaluation failed (HTTP ${response.status})`;

      try {
        const errorData = await response.json();

        if (typeof errorData.detail === "string") {
          message = errorData.detail;
        }
      } catch {
        // Keep the original HTTP error message.
      }

      throw new Error(message);
    }

    result = await response.json();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Evaluation failed";

    redirect(
      `/evaluations?error=${encodeURIComponent(message)}`
    );
  }

  const params = new URLSearchParams({
    success: "true",
    total: String(result.total_cases),
    passed: String(result.passed_cases),
    failed: String(result.failed_cases),
    score:
      result.average_score === null
        ? "N/A"
        : `${(result.average_score * 100).toFixed(1)}%`,
  });

  redirect(`/evaluations?${params.toString()}`);
}

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
    total?: string;
    passed?: string;
    failed?: string;
    score?: string;
  }>;
}) {
  const params = await searchParams;

  let datasets: Dataset[] = [];
  let loadError = "";

  try {
    datasets = await getDatasets();
  } catch {
    loadError =
      "Cannot connect to the evaluation backend. Check port 8000.";
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}

      <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6">

        <h1 className="text-3xl font-bold text-emerald-400">
          EvalAI
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          AI Evaluation Platform
        </p>

        <nav className="mt-14 space-y-3">

          <Link
            href="/"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <Link
            href="/evaluations"
            className="block rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white"
          >
            Evaluations
          </Link>

          <Link
            href="/datasets"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Datasets
          </Link>

          <Link
            href="/history"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            History
          </Link>

        </nav>
      </aside>

      {/* Main content */}

      <main className="min-w-0 flex-1 p-10">

        <p className="text-emerald-400">
          AI Evaluation Platform
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Evaluations
        </h1>

        <p className="mt-4 text-slate-400">
          Run and manage AI system evaluations.
        </p>

        {/* Evaluators information */}

        <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="text-xl font-bold">
            Active Evaluators
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Every dataset evaluation will use the following evaluators.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            {EVALUATORS.map((evaluator) => (
              <span
                key={evaluator}
                className="rounded-full border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-400"
              >
                {evaluator}
              </span>
            ))}

          </div>

          <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">

            <p className="text-sm text-slate-300">
              LLM Judge uses the configured Ollama model to evaluate
              the semantic quality of AI-generated answers.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Make sure Ollama and the evaluation backend are running
              before starting an evaluation.
            </p>

          </div>

        </section>

        {/* Success */}

        {params.success === "true" && (
          <div className="mt-8 rounded-xl border border-emerald-700 bg-emerald-950 p-6">

            <h2 className="text-xl font-bold text-emerald-400">
              Evaluation Completed
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              The evaluation run has finished. Review the results below
              or open History for individual evaluator results.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-sm text-slate-400">
                  Total Cases
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {params.total}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Passed
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {params.passed}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Failed
                </p>

                <p className="mt-2 text-2xl font-bold text-red-400">
                  {params.failed}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Average Score
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {params.score}
                </p>
              </div>

            </div>

            <Link
              href="/history"
              className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
            >
              View Evaluation History
            </Link>

          </div>
        )}

        {/* Error */}

        {(params.error || loadError) && (
          <div className="mt-8 rounded-xl border border-red-700 bg-red-950 p-5 text-red-300">
            {params.error || loadError}
          </div>
        )}

        {/* Dataset selection */}

        <section className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-8">

          <h2 className="text-2xl font-bold">
            Select a Dataset
          </h2>

          <p className="mt-2 text-slate-400">
            Choose a dataset to evaluate against its registered AI system.
          </p>

          <div className="mt-8 space-y-5">

            {datasets.map((dataset) => (

              <div
                key={dataset.id}
                className="rounded-xl border border-slate-700 bg-slate-950 p-6"
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <h3 className="text-xl font-bold">
                      {dataset.name}
                    </h3>

                    <p className="mt-2 text-slate-400">
                      {dataset.system} · {dataset.version}
                    </p>

                  </div>

                  <span className="rounded-full bg-emerald-950 px-4 py-2 text-sm text-emerald-400">
                    {dataset.case_count} Cases
                  </span>

                </div>

                <p className="mt-5 break-all text-sm text-slate-500">
                  Dataset ID: {dataset.id}
                </p>

                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4">

                  <p className="text-sm font-semibold text-slate-300">
                    Evaluation Configuration
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-400">

                    <p>✓ Contains Answer</p>

                    <p>✓ Required Fields</p>

                    <p>✓ LLM Judge (Ollama)</p>

                  </div>

                </div>

                <form
                  action={runEvaluation}
                  className="mt-6"
                >

                  <input
                    type="hidden"
                    name="dataset_id"
                    value={dataset.id}
                  />

                  <button
                    type="submit"
                    disabled={dataset.case_count === 0}
                    className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Run Evaluation
                  </button>

                </form>

              </div>

            ))}

            {!loadError && datasets.length === 0 && (
              <p className="text-slate-400">
                No datasets available.
              </p>
            )}

          </div>

        </section>

        {/* API documentation */}

        <a
          href={`${API_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
        >
          Open API Documentation
        </a>

      </main>

    </div>
  );
}