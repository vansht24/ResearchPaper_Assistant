from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.api.routes import upload, query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    upload.router,
    prefix="/api/upload",
    tags=["Upload"]
)

app.include_router(
    query.router,
    prefix="/api/query",
    tags=["Query"]
)


@app.get("/")
def read_root():
    return {
        "status": "Backend is running 🚀",
        "environment": settings.environment
    }
