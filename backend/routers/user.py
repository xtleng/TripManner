from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from routers.auth import fake_users_db, get_current_user
from schemas.auth import UserInfo

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserInfo)
async def get_profile(username: str = Depends(get_current_user)):
    user = fake_users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserInfo(
        username=username,
        nickname=user.get("nickname"),
        avatar=user.get("avatar"),
    )


@router.put("/profile", response_model=UserInfo)
async def update_profile(
    nickname: str | None = None,
    avatar: str | None = None,
    username: str = Depends(get_current_user),
):
    user = fake_users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if nickname is not None:
        user["nickname"] = nickname
    if avatar is not None:
        user["avatar"] = avatar

    return UserInfo(
        username=username,
        nickname=user.get("nickname"),
        avatar=user.get("avatar"),
    )


@router.put("/preferences")
async def update_preferences(
    preferences: dict,
    username: str = Depends(get_current_user),
):
    user = fake_users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["preferences"] = preferences
    return {"message": "Preferences updated", "preferences": preferences}
