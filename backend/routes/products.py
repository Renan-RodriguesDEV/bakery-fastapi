import base64

from auth.auth import get_current_user
from db.connection import get_session
from db.entities import Product, User
from exceptions.handle_exceptions import (
    exception_access_dained_for_user,
    exception_missing_content,
    exception_product_not_found,
)
from fastapi import APIRouter, Depends, File, UploadFile, status
from schemas.product import (
    ProductCreateSchema,
    ProductPublicSchema,
    ProductUpdatePartialSchema,
    ProductUpdateSchema,
)
from sqlalchemy.orm import Session

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/all", status_code=status.HTTP_200_OK)
def get_all(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    return session.query(Product).all()


@router.get("/{id}", status_code=status.HTTP_200_OK)
def get(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    product = session.query(Product).filter(Product.id == id).first()
    if not product:
        raise exception_product_not_found
    return product


@router.post(
    "/create", response_model=ProductPublicSchema, status_code=status.HTTP_201_CREATED
)
def create(
    product: ProductCreateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user

    product_db = Product(**product.model_dump())
    session.add(product_db)
    session.commit()
    session.refresh(product_db)
    return product_db


@router.put(
    "/update/{id}", response_model=ProductPublicSchema, status_code=status.HTTP_200_OK
)
def update(
    id: int,
    product: ProductUpdateSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user

    product_db = session.query(Product).filter(Product.id == id).first()
    if not product_db:
        raise exception_product_not_found
    product_data = product.model_dump()
    for key, value in product_data.items():
        if not value:
            raise exception_missing_content
        setattr(product_db, key, value)
    session.commit()
    session.refresh(product_db)
    return product_db


@router.patch(
    "/update/{id}", response_model=ProductPublicSchema, status_code=status.HTTP_200_OK
)
def update_partial(
    id: int,
    product: ProductUpdatePartialSchema,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    product_db = session.query(Product).filter(Product.id == id).first()
    if not product_db:
        raise exception_product_not_found
    product_data = product.model_dump(exclude_unset=True)
    for key, value in product_data.items():
        setattr(product_db, key, value)
    session.commit()
    session.refresh(product_db)
    return product_db


@router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    product = session.query(Product).filter(Product.id == id).first()
    if not product:
        raise exception_product_not_found
    session.delete(product)
    return {
        "status": status.HTTP_204_NO_CONTENT,
        "message": "successfully in deleted product",
    }


@router.post("/image/{id}", status_code=status.HTTP_200_OK, tags=["files"])
async def send_image(
    id: int,
    image: UploadFile = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    if not image:
        raise exception_missing_content
    image_bytes = await image.read()
    product = session.query(Product).filter(Product.id == id).first()
    if not product:
        raise exception_product_not_found
    product.image = image_bytes
    session.commit()
    session.refresh(product)
    return base64.b64encode(product.image).decode()


@router.get("/image/{id}", status_code=status.HTTP_200_OK, tags=["files"])
async def get_image(
    id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise exception_access_dained_for_user
    product = session.query(Product).filter(Product.id == id).first()
    if not product:
        raise exception_product_not_found
    return base64.b64encode(product.image).decode()
