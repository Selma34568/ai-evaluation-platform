import copy
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path


DATA_FILE = Path("backend/data/datasets.json")


PREFIXES = [
    "",
    "Please answer briefly: ",
    "Based on ATA University information, ",
    "Using the available university information, ",
    "Can you tell me: ",
    "I need to know: ",
    "Please provide the answer to this question: ",
    "According to ATA University data, ",
    "Answer accurately: ",
    "For an applicant, please clarify: ",
]


def load_data():
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_datasets(data):
    if isinstance(data, list):
        return data

    if isinstance(data, dict) and isinstance(data.get("datasets"), list):
        return data["datasets"]

    raise ValueError("Unsupported datasets.json structure")


def main():
    data = load_data()
    datasets = get_datasets(data)

    source = None

    for dataset in datasets:
        if (
            dataset.get("system") == "ata-rag"
            and len(dataset.get("cases", [])) == 10
        ):
            source = dataset
            break

    if source is None:
        raise RuntimeError(
            "Could not find the 10-case ATA RAG dataset."
        )

    new_cases = []

    for original in source["cases"]:
        original_question = original["input"]["question"].strip()

        for variant_number, prefix in enumerate(PREFIXES, start=1):
            case = copy.deepcopy(original)

            base_id = original.get("id", "ata")
            case["id"] = f"{base_id}-p{variant_number:02d}"

            if prefix:
                question = prefix + original_question
            else:
                question = original_question

            case["input"]["question"] = question

            case.setdefault("metadata", {})
            case["metadata"]["source_case_id"] = base_id
            case["metadata"]["variant"] = variant_number
            case["metadata"]["evaluation_type"] = "paraphrase_robustness"

            new_cases.append(case)

    if len(new_cases) != 100:
        raise RuntimeError(
            f"Expected 100 cases, generated {len(new_cases)}"
        )

    new_dataset = copy.deepcopy(source)

    new_dataset["id"] = str(uuid.uuid4())
    new_dataset["name"] = "ATA RAG 100-Case Robustness Test"
    new_dataset["version"] = "v1"
    new_dataset["description"] = (
        "100-case paraphrase robustness evaluation derived from "
        "10 validated ATA RAG golden cases."
    )
    new_dataset["cases"] = new_cases
    new_dataset["created_at"] = datetime.now(timezone.utc).isoformat()

    datasets.append(new_dataset)

    save_data(data)

    print("Dataset created successfully.")
    print("Name:", new_dataset["name"])
    print("System:", new_dataset.get("system"))
    print("Cases:", len(new_dataset["cases"]))
    print("Dataset ID:", new_dataset["id"])


if __name__ == "__main__":
    main()