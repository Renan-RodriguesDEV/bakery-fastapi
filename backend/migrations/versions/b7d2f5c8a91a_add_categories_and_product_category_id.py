"""add categories and product category_id

Revision ID: b7d2f5c8a91a
Revises: c43b2ecb9e7e
Create Date: 2026-04-09 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b7d2f5c8a91a"
down_revision: Union[str, Sequence[str], None] = "c43b2ecb9e7e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "categorias" not in inspector.get_table_names():
        op.create_table(
            "categorias",
            sa.Column(
                "id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False
            ),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column(
                "created_at",
                sa.TIMESTAMP(),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )

    product_columns = {column["name"] for column in inspector.get_columns("produtos")}
    if "category_id" not in product_columns:
        op.add_column(
            "produtos",
            sa.Column("category_id", sa.Integer(), nullable=True),
        )

    foreign_keys = inspector.get_foreign_keys("produtos")
    has_category_fk = any(
        fk.get("referred_table") == "categorias"
        and fk.get("constrained_columns") == ["category_id"]
        for fk in foreign_keys
    )
    if not has_category_fk:
        op.create_foreign_key(
            "fk_produtos_categoria_id",
            "produtos",
            "categorias",
            ["category_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "produtos" in inspector.get_table_names():
        foreign_keys = inspector.get_foreign_keys("produtos")
        category_fk_name = next(
            (
                fk.get("name")
                for fk in foreign_keys
                if fk.get("referred_table") == "categorias"
                and fk.get("constrained_columns") == ["category_id"]
            ),
            None,
        )
        if category_fk_name:
            op.drop_constraint(category_fk_name, "produtos", type_="foreignkey")

        product_columns = {
            column["name"] for column in inspector.get_columns("produtos")
        }
        if "category_id" in product_columns:
            op.drop_column("produtos", "category_id")

    if "categorias" in inspector.get_table_names():
        op.drop_table("categorias")
