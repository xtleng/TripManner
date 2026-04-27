from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from schemas.plan import RoutePlanRequest, RoutePlanResponse
from services.route_decision import determine_algorithm

router = APIRouter(prefix="/plan", tags=["plan"])

# In-memory store for plans (Phase 2 placeholder)
_plans: dict[str, RoutePlanResponse] = {}


@router.post("/route", response_model=RoutePlanResponse)
async def create_route_plan(body: RoutePlanRequest):
    """Create a new route plan (stub -- returns placeholder data)."""
    algorithm = determine_algorithm(
        destination_city=body.destination_city,
        source_city=body.source_city,
    )

    plan_id = str(uuid.uuid4())
    plan = RoutePlanResponse(
        plan_id=plan_id,
        city=body.destination_city,
        algorithm=algorithm,
        days=[],
        summary=f"Stub plan for {body.destination_city} using {algorithm} algorithm ({body.days} days).",
    )
    _plans[plan_id] = plan
    return plan


@router.get("/history", response_model=list[RoutePlanResponse])
async def get_plan_history():
    """Return all plans (stub -- returns current in-memory plans)."""
    return list(_plans.values())


@router.get("/{plan_id}", response_model=RoutePlanResponse)
async def get_plan(plan_id: str):
    """Get a specific plan by ID."""
    plan = _plans.get(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan
