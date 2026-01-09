from config.config import credentials
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class ConnectionDB:
    """Class of connection for db, using orm sqlalchemy"""

    def __init__(self, url: str = credentials.get("url"), echo: bool = False):
        self.url = url
        self.echo = echo

    @property
    def engine(self):
        return create_engine(self.url, echo=self.echo)

    @property
    def session(self):
        Session = sessionmaker(self.engine)
        return Session()

    def __enter__(self):
        return self

    def __exit__(self, exec_type, exec_val, exec_tb):
        self.session.close()


def get_session():
    engine = create_engine(credentials.get("url"), echo=True)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    except Exception as e:
        print(f"Error getting DB session: {e}")
        session.rollback()
        raise
    finally:
        session.close()
