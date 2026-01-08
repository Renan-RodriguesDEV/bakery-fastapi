import os

from dotenv import load_dotenv

load_dotenv()

credentials = {
    "url": os.getenv("DB_URL"),
    "DEBUG": True if os.getenv("DEBUG") == "TRUE" else False,
    "ALGORITHM": os.getenv("ALGORITHM", "HS256"),
    "SECRET_KEY": os.getenv("SECRET_KEY", "MY-SECRET-KEY"),
    "ACCESS_TOKEN_EXPIRE_TIME": os.getenv("ACCESS_TOKEN_EXPIRE_TIME", "4320"),
}
