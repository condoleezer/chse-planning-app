import os
import sys

# Assure que /app et le dossier courant sont dans sys.path (pour Docker/uvicorn)
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from routers import user, sessions, role, service, absence, program, asks, code, contrat, speciality

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
    