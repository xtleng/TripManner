from __future__ import annotations


class CrossCityService:
    """Service wrapper for the Cross-City route prediction algorithm.

    This is a stub that will be replaced with the actual algorithm integration.
    """

    def __init__(self):
        self.model_loaded = False

    def load_model(self, source_city: str, destination_city: str) -> None:
        """Load the pre-trained cross-city model."""
        raise NotImplementedError("Cross-City model loading not yet integrated")

    def predict(
        self,
        source_city: str,
        destination_city: str,
        preferences: dict | None = None,
    ) -> dict:
        """Run the Cross-City algorithm and return a route prediction.

        Args:
            source_city: Origin city name.
            destination_city: Destination city name.
            preferences: Optional user preference dict.

        Returns:
            dict with route plan data.

        Raises:
            NotImplementedError: Algorithm not yet integrated.
        """
        from config import settings

        if settings.USE_MOCK_DATA:
            return {
                "algorithm": "cross_city",
                "source_city": source_city,
                "destination_city": destination_city,
                "route": [],
                "mock": True,
                "message": "Mock Cross-City result",
            }

        raise NotImplementedError("Cross-City algorithm not yet integrated")
