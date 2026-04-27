from db.base import Base
from db.connection import get_engine
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

    def __init__(
        self, name, username, password, telephone=None, token=None, is_admin=False
    ):
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
    validity = Column(TIMESTAMP, nullable=False, server_default=func.now())
    image = Column(LargeBinary, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    # chave estrangeira que referencia a tabela "categorias", ondelete="CASCADE" significa que quando uma categoria for excluída, todos os produtos relacionados a essa categoria também serão excluídos, nullable=False significa que o campo não pode ser nulo, ou seja, um produto deve obrigatoriamente pertencer a uma categoria.
    category_id = Column(
        ForeignKey("categorias.id", ondelete="CASCADE"), nullable=False
    )
    sale = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    shopping_cart = relationship(
        "ShoppingCart", back_populates="product", cascade="all, delete-orphan"
    )
    # Na tabela filha (Product) fica o atributo "category" e na tabela pai (Category) fica o atributo "product", back_populates é usado para criar a relação bidirecional entre as tabelas, não é usado o cascade no atributo "category" pois a relação é gerenciada pela tabela filha.
    category = relationship("Category", back_populates="product")

    def __init__(self, name, price, stock, category_id=None, validity=None, image=None):
        self.name = name
        self.price = price
        self.stock = stock
        self.category_id = category_id
        self.validity = validity
        self.image = image


class Category(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    # Na tabela pai (Category) fica o atributo "product" e na tabela filha (Product) fica o atributo "category", back_populates é usado para criar a relação bidirecional entre as tabelas, cascade é usado para definir o comportamento de exclusão em cascata, ou seja, quando uma categoria for excluída, todos os produtos relacionados a essa categoria também serão excluídos.
    # No pai não precisa do atributo "category_id" porque ele já tem o relacionamento com a tabela filha (Product) através do atributo "product", e no filho (Product) precisa do atributo "category_id" para criar a chave estrangeira que referencia a tabela pai (Category).
    product = relationship(
        "Product", back_populates="category", cascade="all, delete-orphan"
    )

    def __init__(self, name):
        self.name = name


class Sale(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)
    count = Column(Integer, nullable=False)
    value = Column(Float, nullable=False)
    payment_id = Column(String, nullable=True)
    was_paid = Column(Boolean, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    user = relationship("User", back_populates="sale")
    product = relationship("Product", back_populates="sale")

    def __init__(
        self,
        user_id,
        product_id,
        count,
        value=0.0,
        payment_id=None,
        was_paid=False,
        created_at=None,
    ):
        self.user_id = user_id
        self.product_id = product_id
        self.count = count
        self.value = value
        self.payment_id = payment_id
        self.was_paid = was_paid
        self.created_at = created_at


class ShoppingCart(Base):
    __tablename__ = "carrinhos"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(ForeignKey("produtos.id", ondelete="CASCADE"), nullable=False)
    count = Column(Integer, nullable=False)
    was_purchased = Column(Boolean, nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    user = relationship("User", back_populates="shopping_cart")
    product = relationship("Product", back_populates="shopping_cart")

    def __init__(self, user_id, product_id, count, was_purchased=False):
        self.user_id = user_id
        self.product_id = product_id
        self.count = count
        self.was_purchased = was_purchased


Base.metadata.create_all(get_engine())
