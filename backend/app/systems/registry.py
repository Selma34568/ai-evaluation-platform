from app.systems.base import AISystem


class SystemRegistry:
    def __init__(self) -> None:
        self._systems: dict[str, AISystem] = {}

    def register(
        self,
        system: AISystem,
    ) -> None:
        self._systems[system.name] = system

    def get(
        self,
        system_name: str,
    ) -> AISystem | None:
        return self._systems.get(system_name)

    def get_available_systems(
        self,
    ) -> list[str]:
        return list(self._systems.keys())