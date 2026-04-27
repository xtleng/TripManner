from __future__ import annotations

import asyncio
import json
import uuid

from fastapi import APIRouter, HTTPException
from starlette.responses import StreamingResponse

from schemas.chat import ChatRequest, DialogDetail, DialogSummary

router = APIRouter(prefix="/chat", tags=["chat"])

# In-memory dialog store (Phase 2 placeholder)
_dialogs: dict[str, DialogDetail] = {}


async def _sse_test_stream(message: str):
    """Generate a stub SSE stream that echoes the user message token by token."""
    response_text = f"This is a stub response to: {message}"
    tokens = response_text.split(" ")
    for token in tokens:
        chunk = {"content": token + " ", "done": False}
        yield f"data: {json.dumps(chunk)}\n\n"
        await asyncio.sleep(0.05)
    yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"


@router.post("/message")
async def send_message(body: ChatRequest):
    """SSE streaming chat endpoint (stub)."""
    dialog_id = body.dialog_id or str(uuid.uuid4())

    # Ensure dialog exists
    if dialog_id not in _dialogs:
        _dialogs[dialog_id] = DialogDetail(
            dialog_id=dialog_id,
            title=body.message[:30],
            messages=[],
        )

    dialog = _dialogs[dialog_id]
    dialog.messages.append({"role": "user", "content": body.message})

    return StreamingResponse(
        _sse_test_stream(body.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Dialog-Id": dialog_id,
        },
    )


@router.get("/dialogs", response_model=list[DialogSummary])
async def list_dialogs():
    """List all dialog sessions."""
    return [
        DialogSummary(
            dialog_id=d.dialog_id,
            title=d.title,
            last_message=d.messages[-1].content if d.messages else None,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in _dialogs.values()
    ]


@router.get("/dialogs/{dialog_id}", response_model=DialogDetail)
async def get_dialog(dialog_id: str):
    """Get a specific dialog with full message history."""
    dialog = _dialogs.get(dialog_id)
    if not dialog:
        raise HTTPException(status_code=404, detail="Dialog not found")
    return dialog
