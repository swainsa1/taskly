from fastapi import APIRouter
from tags import TAGS, AVATARS

router = APIRouter(prefix="/api/v1", tags=["meta"])


@router.get("/tags")
def list_tags():
    return {"tags": TAGS, "avatars": AVATARS}
