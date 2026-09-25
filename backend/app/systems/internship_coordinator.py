from typing import Any

import httpx

from app.systems.base import AISystem


class InternshipCoordinatorSystem(AISystem):
    name = "internship-coordinator"

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    async def run(
        self,
        input_data: dict[str, Any],
    ) -> dict[str, Any]:
        payload = {
            "email_sender": input_data.get("email_sender", ""),
            "email_subject": input_data.get("email_subject", ""),
            "email_body": input_data.get("email_body", ""),
            "attachment_paths": input_data.get("attachment_paths", []),
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/cases/intake",
                json=payload,
            )

            response.raise_for_status()
            data = response.json()

        if not isinstance(data, dict):
            raise ValueError(
                "Internship Coordinator response must be a JSON object."
            )

        return data