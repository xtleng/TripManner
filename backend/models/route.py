from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    algorithm: Mapped[str | None] = mapped_column(String(50), nullable=True)
    plan_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # Full plan as JSON
    total_cost_estimate: Mapped[float | None] = mapped_column(Float, nullable=True)
    days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
