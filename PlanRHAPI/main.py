import os
import sys

# Ensure the application directory is on sys.path so top-level imports like
# `from database.database import db` work regardless of how the module is started
# (uvicorn, python -m, or inside Docker). This is a small, explicit fallback
# that avoids import errors when PYTHONPATH isn't applied at runtime.
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


# Ensure /app and its parent are on sys.path for Docker/Compose import reliability
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from routers import user, sessions, role, service, absence, program, asks, code, contrat, speciality

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

app.include_router(user.router, prefix=API_PREFIX)
app.include_router(role.router, prefix=API_PREFIX)
app.include_router(absence.router, prefix=API_PREFIX)
app.include_router(program.router, prefix=API_PREFIX)
app.include_router(code.router, prefix=API_PREFIX)
app.include_router(asks.router, prefix=API_PREFIX)
app.include_router(service.router, prefix=API_PREFIX)
app.include_router(contrat.router, prefix=API_PREFIX)
app.include_router(speciality.router, prefix=API_PREFIX)
app.include_router(sessions.router, prefix=API_PREFIX)

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
