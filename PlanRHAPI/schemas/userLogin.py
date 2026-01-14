from pydantic import BaseModel


class UserLogin(BaseModel):
    email: str
    password: str
    role: str