import uvicorn
from config.config import credentials
from fastapi import FastAPI, status
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.sales import router as sales_router
from routes.users import router as users_router

app = FastAPI(
    title="Back-end Padaria da Vila!",
    description="back-end para consumo em NextJS feito em FastAPI",
    version="0.0.1",
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(sales_router)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["health"])
def health():
    return {"status": status.HTTP_200_OK, "health": ":]"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=credentials.get("DEBUG"))
