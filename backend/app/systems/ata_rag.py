from typing import Any

import httpx

from app.systems.base import AISystem


class AtaRagSystem(AISystem):
    name = "ata-rag"

    def __init__(
        self,
        base_url: str,
        timeout: float = 60.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def run(
        self,
        input_data: dict[str, Any],
    ) -> dict[str, Any]:

        question = input_data.get("question")

        if not question:
            raise ValueError(
                "ATA RAG input must contain a 'question' field."
            )

        payload = {
            "question": question,
            "language": input_data.get(
                "language",
                "en",
            ),
            "retrieval_limit": input_data.get(
                "retrieval_limit",
                10,
            ),
        }

        session_id = input_data.get("session_id")

        if session_id is not None:
            payload["session_id"] = session_id

        async with httpx.AsyncClient(
            timeout=self.timeout
        ) as client:

            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
            )

            response.raise_for_status()

            data = response.json()

        answer = (
            data.get("answer")
            or data.get("response")
            or data.get("message")
        )

        if answer is None:
            raise ValueError(
                "ATA RAG response does not contain "
                "a recognized answer field."
            )

        actual_output: dict[str, Any] = {
            "answer": answer,
        }

        citations = (
            data.get("citations")
            or data.get("sources")
        )

        if citations is not None:
            actual_output["citations"] = citations

        if "latency_ms" in data:
            actual_output["latency_ms"] = data["latency_ms"]

        return actual_output