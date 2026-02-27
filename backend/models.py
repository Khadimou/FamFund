from pydantic import BaseModel, EmailStr, field_validator


class WaitlistEntry(BaseModel):
    email: EmailStr
    source: str = "unknown"

    @field_validator("source")
    @classmethod
    def sanitize_source(cls, v: str) -> str:
        return v[:50].strip()


class WaitlistResponse(BaseModel):
    success: bool
    position: int
