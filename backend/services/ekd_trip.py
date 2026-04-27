from __future__ import annotations


class EKDTripService:
    """Service wrapper for the EKD-Trip route prediction algorithm.

    This is a stub that will be replaced with the actual algorithm integration.
    """

    def __init__(self):
        self.model_loaded = False

    def load_model(self, city: str) -> None:
        """Load the pre-trained model for a given city."""
        raise NotImplementedError("EKD-Trip model loading not yet integrated")

    def predict(self, city: str, preferences: dict | None = None) -> dict:
        """Run the EKD-Trip algorithm and return a route prediction.

        Args:
            city: Target city name.
            preferences: Optional user preference dict.

        Returns:
            dict with route plan data.

        Raises:
            NotImplementedError: Algorithm not yet integrated.
        """
        # In mock mode, return sample data
        from config import settings

        if settings.USE_MOCK_DATA:
            return {
                "algorithm": "ekd_trip",
                "city": city,
                "route": [],
                "mock": True,
                "message": "Mock EKD-Trip result",
            }

        raise NotImplementedError("EKD-Trip algorithm not yet integrated")
