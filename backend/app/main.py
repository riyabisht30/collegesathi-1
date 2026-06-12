from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth_routes, college_routes, recommend_routes, wishlist_routes, admin_routes

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="College admission tracker and recommendation engine for first-generation students in India",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/api")
app.include_router(college_routes.router, prefix="/api")
app.include_router(recommend_routes.router, prefix="/api")
app.include_router(wishlist_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
