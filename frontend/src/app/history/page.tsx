import Link from "next/link";

const API_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000";

type EvaluationResult = {
  dataset_id: string;
  dataset_name: string;
  system: string;
  version: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  average_score: number | null;
  results: {
    case_id: string;
    evaluation: {
      case_id: string;
      system: string;
      results: {
        evaluator: string;
        score: number;
        passed: boolean;
        category: string;
        reason: string;
      }[];
    };
  }[];
};

type HistoryRecord = {
  id: string;
  created_at: string;
  mode: string;
  result: EvaluationResult;
};

async function getHistory(): Promise<HistoryRecord[]> {
  const response = await fetch(
    `${API_URL}/datasets/history`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load evaluation history (${response.status})`
    );
  }

  return response.json();
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatScore(score: number | null) {
  if (score === null) {
    return "N/A";
  }

  return `${(score * 100).toFixed(1)}%`;
}

export default async function HistoryPage() {
  let history: HistoryRecord[] = [];
  let error: string | null = null;

  try {
    history = await getHistory();
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Unable to load evaluation history.";
  }

  const totalRuns = history.length;

  const totalCases = history.reduce(
    (sum, item) => sum + item.result.total_cases,
    0
  );

  const passedCases = history.reduce(
    (sum, item) => sum + item.result.passed_cases,
    0
  );

  const failedCases = history.reduce(
    (sum, item) => sum + item.result.failed_cases,
    0
  );

  const passRate =
    totalCases > 0
      ? ((passedCases / totalCases) * 100).toFixed(1)
      : "0.0";

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  const stats = [
    {
      title: "Total Evaluations",
      value: totalRuns,
    },
    {
      title: "Total Test Cases",
      value: totalCases,
    },
    {
      title: "Passed Cases",
      value: passedCases,
    },
    {
      title: "Failed Cases",
      value: failedCases,
    },
    {
      title: "Pass Rate",
      value: `${passRate}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1020] text-white md:flex">

      {/* Sidebar */}

      <aside className="w-full border-b border-slate-700 bg-[#182131] p-6 md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">

        <Link
          href="/"
          className="text-3xl font-bold text-emerald-400"
        >
          EvalAI
        </Link>

        <p className="mt-2 text-sm text-slate-400">
          AI Evaluation Platform
        </p>

        <nav className="mt-12 flex flex-col gap-3">

          <Link
            href="/"
            className="rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-700"
          >
            Dashboard
          </Link>

          <Link
            href="/evaluations"
            className="rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-700"
          >
            Evaluations
          </Link>

          <Link
            href="/datasets"
            className="rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-700"
          >
            Datasets
          </Link>

          <Link
            href="/history"
            className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white"
          >
            History
          </Link>

        </nav>

      </aside>

      {/* Main content */}

      <main className="min-w-0 flex-1 p-6 md:p-10">

        <p className="font-medium text-emerald-400">
          AI Evaluation Platform
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Evaluation History
        </h1>

        <p className="mt-4 text-slate-400">
          View and analyze previous AI system evaluations.
        </p>

        {/* Statistics */}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-700 bg-[#182131] p-7"
            >
              <p className="text-slate-400">
                {stat.title}
              </p>

              <p className="mt-5 text-4xl font-bold text-emerald-400">
                {stat.value}
              </p>
            </div>
          ))}

        </div>

        {/* History section */}

        <section className="mt-12 rounded-2xl border border-slate-700 bg-[#182131] p-6 md:p-8">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold">
                Previous Evaluations
              </h2>

              <p className="mt-2 text-slate-400">
                All stored evaluation runs.
              </p>
            </div>

            <Link
              href="/evaluations"
              className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              New Evaluation
            </Link>

          </div>

          {/* Error message */}

          {error && (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-700 bg-red-950/40 p-5 text-red-300"
            >
              {error}

              <p className="mt-2 text-sm">
                Check that the backend is running on port 8000.
              </p>
            </div>
          )}

          {/* Empty state */}

          {!error && sortedHistory.length === 0 && (
            <div className="mt-8 rounded-xl border border-slate-700 bg-[#0b1020] p-8 text-center">

              <h3 className="text-xl font-semibold">
                No evaluation history yet
              </h3>

              <p className="mt-3 text-slate-400">
                Run an evaluation to generate your first history record.
              </p>

              <Link
                href="/evaluations"
                className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-700"
              >
                Run Evaluation
              </Link>

            </div>
          )}

          {/* Evaluation records */}

          <div className="mt-8 space-y-5">

            {sortedHistory.map((record) => {

              const result = record.result;

              const rate =
                result.total_cases > 0
                  ? (
                      (result.passed_cases /
                        result.total_cases) *
                      100
                    ).toFixed(1)
                  : "0.0";

              return (
                <article
                  key={record.id}
                  className="rounded-xl border border-slate-700 bg-[#0b1020] p-6"
                >

                  <div className="flex flex-wrap items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h3 className="text-xl font-bold">
                        {result.dataset_name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        {result.system} · {result.version}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatDate(record.created_at)}
                      </p>

                    </div>

                    <span className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-emerald-400">
                      {record.mode}
                    </span>

                  </div>

                  {/* Result statistics */}

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-700 pt-6 lg:grid-cols-5">

                    <div>
                      <p className="text-sm text-slate-400">
                        Total Cases
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {result.total_cases}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Passed
                      </p>

                      <p className="mt-2 text-2xl font-bold text-emerald-400">
                        {result.passed_cases}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Failed
                      </p>

                      <p className="mt-2 text-2xl font-bold text-red-400">
                        {result.failed_cases}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Pass Rate
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {rate}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Average Score
                      </p>

                      <p className="mt-2 text-2xl font-bold text-emerald-400">
                        {formatScore(result.average_score)}
                      </p>
                    </div>

                  </div>

                  {/* History ID */}

                  <div className="mt-6 rounded-lg bg-[#182131] p-4">

                    <p className="text-xs text-slate-400">
                      History ID
                    </p>

                    <p className="mt-2 break-all font-mono text-sm text-emerald-400">
                      {record.id}
                    </p>

                  </div>

                  {/* Individual test results */}

                  <details className="mt-6">

                    <summary className="cursor-pointer font-semibold text-emerald-400">
                      View Test Results
                    </summary>

                    <div className="mt-5 space-y-4">

                      {result.results.map((item) => (

                        <div
                          key={item.case_id}
                          className="rounded-lg border border-slate-700 bg-[#182131] p-5"
                        >

                          <p className="font-semibold">
                            Case: {item.case_id}
                          </p>

                          <div className="mt-4 space-y-3">

                            {item.evaluation.results.map(
                              (evaluation, index) => (

                                <div
                                  key={`${evaluation.evaluator}-${index}`}
                                  className="rounded-lg bg-[#0b1020] p-4"
                                >

                                  <div className="flex flex-wrap justify-between gap-2">

                                    <span className="font-medium">
                                      {evaluation.evaluator}
                                    </span>

                                    <span
                                      className={
                                        evaluation.passed
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                      }
                                    >
                                      {evaluation.passed
                                        ? "PASSED"
                                        : "FAILED"}
                                    </span>

                                  </div>

                                  <p className="mt-2 text-sm text-slate-400">
                                    Score: {formatScore(evaluation.score)}
                                  </p>

                                  <p className="mt-2 text-sm text-slate-400">
                                    {evaluation.reason}
                                  </p>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      ))}

                    </div>

                  </details>

                </article>
              );
            })}

          </div>

        </section>

        {/* API documentation */}

        <div className="mt-8">

          <a
            href={`${API_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Open API Documentation
          </a>

        </div>

      </main>

    </div>
  );
}