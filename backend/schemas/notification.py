from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class NotificationBaseSchema(BaseModel):
    user_id: int
    type: Literal["stock", "payment"]
    title: str
    message: str
    related_id: Optional[int] = None


class NotificationCreateSchema(NotificationBaseSchema):
    pass


class NotificationPublicSchema(NotificationBaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_read: bool
    created_at: datetime


class NotificationUpdateSchema(BaseModel):
    is_read: bool
