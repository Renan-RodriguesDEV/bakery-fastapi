import os

import uvicorn
from config.config import credentials
from dotenv import load_dotenv
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.cart import router as cart_router
from routes.products import router as products_router
from routes.sales import router as sales_router
from routes.users import router as users_router
from routes.websocket import router as websocket_router

load_dotenv()
app = FastAPI(
    title="Back-end Padaria da Vila!",
    description="back-end para consumo em NextJS feito em FastAPI",
    version="0.0.1",
)
# configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL"), "http://localhost:3000"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

# incluindo rotas da aplicação
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(sales_router)
app.include_router(cart_router)
app.include_router(websocket_router)


@app.get("/health", status_code=status.HTTP_200_OK, tags=["health"])
def health():
    return {"status": status.HTTP_200_OK, "health": ":]"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=credentials.get("DEBUG"))
