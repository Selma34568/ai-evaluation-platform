import Link from "next/link";

const API_URL =
  process.env.API_BASE_URL ||
  "http://127.0.0.1:8000";

type EvaluationCase = {
  id: string;
  system: string;
  input: Record<string, unknown>;
  expected_output: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

type Dataset = {
  id: string;
  name: string;
  system: string;
  version: string;
  description: string;
  cases: EvaluationCase[];
  created_at: string;
};

type DatasetSummary = {
  id: string;
  name: string;
  system: string;
  version: string;
  case_count: number;
  created_at: string;
};

async function getDatasets(): Promise<DatasetSummary[]> {
  const response = await fetch(`${API_URL}/datasets`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load datasets.");
  }

  return response.json();
}

async function getDataset(id: string): Promise<Dataset> {
  const response = await fetch(
    `${API_URL}/datasets/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load dataset details.");
  }

  return response.json();
}

export default async function DatasetsPage() {
  let datasets: Dataset[] = [];
  let error: string | null = null;

  try {
    const summaries = await getDatasets();

    datasets = await Promise.all(
      summaries.map((dataset) => getDataset(dataset.id))
    );
  } catch {
    error =
      "Could not connect to the backend. Please check that the API is running on port 8000.";
  }

  const totalCases = datasets.reduce(
    (total, dataset) => total + dataset.cases.length,
    0
  );

  return (
    <div className="flex min-h-screen bg-[#0b1020] text-white">

      {/* SIDEBAR */}

      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#161e2e] p-6 md:block">

        <div className="mb-14">

          <h1 className="text-3xl font-bold text-emerald-400">
            EvalAI
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            AI Evaluation Platform
          </p>

        </div>

        <nav className="space-y-3">

          <Link
            href="/"
            className="block rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <div className="rounded-lg px-4 py-3 text-slate-400">
            Evaluations
            <span className="ml-2 text-xs text-slate-500">
              Soon
            </span>
          </div>

          <Link
            href="/datasets"
            className="block rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white"
          >
            Datasets
          </Link>

          <div className="rounded-lg px-4 py-3 text-slate-400">
            History
            <span className="ml-2 text-xs text-slate-500">
              Soon
            </span>
          </div>

        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <main className="min-w-0 flex-1 p-6 md:p-10">

        {/* HEADER */}

        <div className="mb-10">

          <p className="mb-2 text-sm font-medium text-emerald-400">
            AI Evaluation Platform
          </p>

          <h1 className="text-4xl font-bold">
            Datasets
          </h1>

          <p className="mt-3 text-slate-400">
            Manage and explore your AI evaluation datasets.
          </p>

          <div className="mt-5 md:hidden">
            <Link
              href="/"
              className="text-sm text-emerald-400 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>

        </div>

        {/* STATISTICS */}

        <div className="mb-10 grid gap-6 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-700 bg-[#161e2e] p-7">

            <p className="text-slate-400">
              Total Datasets
            </p>

            <h2 className="mt-5 text-4xl font-bold text-emerald-400">
              {datasets.length}
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#161e2e] p-7">

            <p className="text-slate-400">
              Total Test Cases
            </p>

            <h2 className="mt-5 text-4xl font-bold text-emerald-400">
              {totalCases}
            </h2>

          </div>

        </div>

        {/* DATASET LIST */}

        <section className="rounded-2xl border border-slate-700 bg-[#161e2e] p-6 md:p-8">

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold">
                Available Datasets
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                View your evaluation datasets and test cases.
              </p>

            </div>

            <a
              href={`${API_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Open API
            </a>

          </div>

          {/* ERROR MESSAGE */}

          {error && (

            <div className="rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300">
              {error}
            </div>

          )}

          {/* EMPTY STATE */}

          {!error && datasets.length === 0 && (

            <div className="rounded-xl border border-slate-700 bg-[#0b1020] p-10 text-center">

              <h3 className="text-xl font-semibold">
                No datasets found
              </h3>

              <p className="mt-3 text-slate-400">
                Create your first dataset using the API documentation.
              </p>

              <a
                href={`${API_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-700"
              >
                Create Dataset
              </a>

            </div>

          )}

          {/* DATASET CARDS */}

          <div className="space-y-6">

            {datasets.map((dataset) => (

              <div
                key={dataset.id}
                className="rounded-xl border border-slate-700 bg-[#0b1020] p-6"
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="text-xl font-bold">
                      {dataset.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {dataset.system} · {dataset.version}
                    </p>

                  </div>

                  <span className="rounded-full bg-emerald-900/40 px-4 py-2 text-sm font-semibold text-emerald-400">
                    {dataset.cases.length} Cases
                  </span>

                </div>

                {/* DESCRIPTION */}

                {dataset.description && (

                  <p className="mt-5 text-slate-300">
                    {dataset.description}
                  </p>

                )}

                {/* DATASET ID */}

                <div className="mt-6 rounded-lg bg-[#161e2e] p-4">

                  <p className="mb-2 text-xs text-slate-400">
                    Dataset ID
                  </p>

                  <p className="break-all font-mono text-sm text-emerald-400">
                    {dataset.id}
                  </p>

                </div>

                {/* TEST CASES */}

                <details className="mt-6">

                  <summary className="cursor-pointer text-sm font-semibold text-emerald-400">
                    View Test Cases
                  </summary>

                  <div className="mt-5 space-y-4">

                    {dataset.cases.map((testCase) => (

                      <div
                        key={testCase.id}
                        className="rounded-lg border border-slate-700 bg-[#161e2e] p-5"
                      >

                        <p className="mb-4 text-sm font-semibold text-white">
                          Case: {testCase.id}
                        </p>

                        <div className="space-y-4">

                          <div>

                            <p className="mb-2 text-xs font-semibold text-slate-400">
                              Input
                            </p>

                            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#0b1020] p-4 text-sm text-slate-300">
                              {JSON.stringify(
                                testCase.input,
                                null,
                                2
                              )}
                            </pre>

                          </div>

                          <div>

                            <p className="mb-2 text-xs font-semibold text-slate-400">
                              Expected Output
                            </p>

                            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#0b1020] p-4 text-sm text-emerald-300">
                              {JSON.stringify(
                                testCase.expected_output,
                                null,
                                2
                              )}
                            </pre>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </details>

                {/* ACTION */}

                <div className="mt-6 flex flex-wrap gap-3">

                  <a
                    href={`${API_URL}/docs#/datasets/run_dataset_against_system_datasets__dataset_id__run_system_post`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Run Evaluation
                  </a>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}