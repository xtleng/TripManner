from __future__ import annotations

from collections.abc import AsyncGenerator


# ---------------------------------------------------------------------------
# Prompt templates (from PRD)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are TripManner, an intelligent travel planning assistant.
Your goal is to help users plan optimal travel routes by understanding their
preferences, budget, travel style, and desired destinations.

When the user provides a destination, you should:
1. Ask clarifying questions about travel dates, budget, and interests.
2. Suggest an optimised route with daily itineraries.
3. Include estimated costs and travel times between POIs.
4. Adapt plans based on user feedback.

Always be friendly, concise, and provide actionable suggestions."""

INTENT_PARSE_PROMPT = """Analyse the following user message and extract structured travel intent.
Return a JSON object with these fields (omit any that are not mentioned):
- destination_city: string
- source_city: string | null
- days: integer
- budget: "low" | "medium" | "high"
- travel_style: string (e.g. "cultural", "adventure", "relaxing")
- specific_requests: list[string]

User message: {message}"""

ROUTE_PLAN_PROMPT = """Given the following travel parameters, create a detailed day-by-day
route plan in JSON format:

Destination: {destination_city}
Days: {days}
Budget: {budget}
Style: {travel_style}
Algorithm result: {algorithm_result}

Return a JSON object matching the RoutePlanResponse schema."""


class DeepSeekAgent:
    """Stub wrapper for the DeepSeek LLM API.

    Will be implemented when the DeepSeek API key is configured.
    """

    def __init__(self):
        from config import settings

        self.api_key = settings.DEEPSEEK_API_KEY
        self.model = settings.DEEPSEEK_MODEL
        self.base_url = settings.DEEPSEEK_BASE_URL

    async def parse_user_intent(self, message: str) -> dict:
        """Parse free-text user message into structured travel intent.

        Returns:
            dict with extracted intent fields.
        """
        # Stub: return a placeholder intent
        return {
            "destination_city": None,
            "source_city": None,
            "days": 3,
            "budget": "medium",
            "travel_style": None,
            "specific_requests": [],
            "raw_message": message,
        }

    async def plan_route_stream(
        self,
        destination_city: str,
        days: int = 3,
        budget: str = "medium",
        travel_style: str | None = None,
        algorithm_result: dict | None = None,
    ) -> AsyncGenerator[str, None]:
        """Stream route planning tokens from the LLM.

        Yields:
            str tokens of the response.
        """
        # Stub: yield a placeholder response
        placeholder = (
            f"Planning a {days}-day trip to {destination_city} "
            f"with a {budget} budget. "
            "This is a stub response -- LLM integration pending."
        )
        for word in placeholder.split(" "):
            yield word + " "
