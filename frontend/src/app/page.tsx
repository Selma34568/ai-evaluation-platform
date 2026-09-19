import Link from "next/link";

type RecentEvaluation = {
  id: string;
  dataset_name: string;
  system: string;
  version: string;
  mode: string;
  created_at: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  average_score: number | null;
};

type DashboardSummary = {
  total_runs: number;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  pass_rate: number;
  average_score: number | null;
  recent_evaluations: RecentEvaluation[];
};

async function getDashboardData(): Promise<DashboardSummary | null> {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/dashboard/summary",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return null;
  }
}

export default async function Home() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "Total Evaluations",
      value: data?.total_runs ?? 0,
    },
    {
      title: "Total Test Cases",
      value: data?.total_cases ?? 0,
    },
    {
      title: "Passed Cases",
      value: data?.passed_cases ?? 0,
    },
    {
      title: "Failed Cases",
      value: data?.failed_cases ?? 0,
    },
    {
      title: "Pass Rate",
      value: data
        ? `${data.pass_rate.toFixed(1)}%`
        : "0%",
    },
    {
      title: "Average Score",
      value:
        data?.average_score != null
          ? `${(data.average_score * 100).toFixed(1)}%`
          : "N/A",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      {/* SIDEBAR */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-[#151d2e] p-6 md:block">
        {/* LOGO */}

        <div className="mb-14">
          <h1 className="text-3xl font-bold text-emerald-400">
            EvalAI
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            AI Evaluation Platform
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="space-y-3">
          <Link
            href="/"
            className="block rounded-lg bg-emerald-600 px-4 py-4 font-semibold text-white transition hover:bg-emerald-500"
          >
            Dashboard
          </Link>

          <span className="block cursor-not-allowed rounded-lg px-4 py-4 text-slate-500">
            Evaluations
          </span>

          <Link
            href="/datasets"
            className="block rounded-lg px-4 py-4 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Datasets
          </Link>

          <span className="block cursor-not-allowed rounded-lg px-4 py-4 text-slate-500">
            History
          </span>
        </nav>
      </aside>

      {/* MAIN CONTENT */}

      <main className="min-h-screen p-6 md:ml-64 md:p-10">
        {/* MOBILE NAVIGATION */}

        <div className="mb-8 flex items-center justify-between gap-4 md:hidden">
          <Link
            href="/"
            className="text-2xl font-bold text-emerald-400"
          >
            EvalAI
          </Link>

          <Link
            href="/datasets"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Datasets
          </Link>
        </div>

        {/* PAGE HEADER */}

        <div className="mb-12">
          <p className="mb-3 text-emerald-400">
            AI Evaluation Platform
          </p>

          <h2 className="text-3xl font-bold md:text-4xl">
            Dashboard Overview
          </h2>

          <p className="mt-4 text-lg text-slate-400">
            Monitor your AI system evaluation performance.
          </p>
        </div>

        {/* API ERROR */}

        {!data && (
          <div className="mb-8 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300">
            Could not connect to the backend API.
            Make sure FastAPI is running on port 8000.
          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-[#151d2e] p-7"
            >
              <p className="mb-5 text-slate-400">
                {stat.title}
              </p>

              <h3 className="text-4xl font-bold text-emerald-400">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* RECENT EVALUATIONS */}

        <section className="rounded-2xl border border-slate-800 bg-[#151d2e] p-7">
          <h3 className="mb-8 text-2xl font-bold">
            Recent Evaluations
          </h3>

          {!data ||
          data.recent_evaluations.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#0b1020] p-6 text-slate-400">
              No evaluation history available.
            </div>
          ) : (
            <div className="space-y-4">
              {data.recent_evaluations.map(
                (evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-[#0b1020] p-6 sm:flex-row sm:items-center"
                  >
                    {/* LEFT SIDE */}

                    <div>
                      <h4 className="text-lg font-semibold">
                        {evaluation.dataset_name}
                      </h4>

                      <p className="mt-2 text-sm text-slate-400">
                        {evaluation.system} ·{" "}
                        {evaluation.version} ·{" "}
                        {evaluation.mode}
                      </p>
                    </div>

                    {/* RIGHT SIDE */}

                    <div className="sm:text-right">
                      <p className="font-semibold text-emerald-400">
                        {evaluation.passed_cases}/
                        {evaluation.total_cases} Passed
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {evaluation.failed_cases} Failed
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* API DOCUMENTATION */}

        <div className="mt-10">
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-emerald-600 px-7 py-4 font-semibold text-white transition hover:bg-emerald-500"
          >
            Open API Documentation
          </a>
        </div>
      </main>
    </div>
  );
}