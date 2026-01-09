from db.base import Base
from db.connection import ConnectionDB
from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Column,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    func,
)
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    telephone = Column(String, unique=True, nullable=True)
    token = Column(String, nullable=True)
    is_admin = Column(Boolean, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    sale = relationship("Sale", back_populates="user", cascade="all, delete-orphan")
    shopping_cart = relationship(
        "ShoppingCart", back_populates="user", cascade="all, delete-orphan"
    )

    def __init__(self, name, username, password, telephone, token=None, is_admin=False):
        self.name = name
        self.username = username
        self.password = password
        self.telephone = telephone
        self.token = token
        self.is_admin = is_admin


class Product(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    stock = Column(Integer, nullable=False, default=0)
    category = Column(String, nullable=False)
    validity = Column(TIMESTAMP, nullable=False, server_default=func.now())
    image = Column(LargeBinary, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    sale = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    shopping_cart = relationship(
        "ShoppingCart", back_populates="product", cascade="all, delete-orphan"
    )

    def __init__(self, name, price, stock, category, validity, image=None):
        self.name = name
        self.price = price
        self.stock = stock
        self.category = category
        self.validity = validity
        self.image = image


class Sale(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)
    count = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    was_paid = Column(Boolean, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    user = relationship("User", back_populates="sale")
    product = relationship("Product", back_populates="sale")

    def __init__(self, user_id, product_id, count, value, was_paid=False):
        self.user_id = user_id
        self.product_id = product_id
        self.count = count
        self.value = value
        self.was_paid = was_paid


class ShoppingCart(Base):
    __tablename__ = "carrinhos"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)
    count = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    was_purchased = Column(Boolean, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    user = relationship("User", back_populates="shopping_cart")
    product = relationship("Product", back_populates="shopping_cart")

    def __init__(self, user_id, product_id, count, value, was_purchased=False):
        self.user_id = user_id
        self.product_id = product_id
        self.count = count
        self.value = value
        self.was_purchased = was_purchased


Base.metadata.create_all(ConnectionDB().engine)
