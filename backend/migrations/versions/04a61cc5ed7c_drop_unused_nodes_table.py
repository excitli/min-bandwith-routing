"""drop unused nodes table

Revision ID: 04a61cc5ed7c
Revises: cd649bf376fe
Create Date: 2026-05-18 18:15:28.551110

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '04a61cc5ed7c'
down_revision: Union[str, Sequence[str], None] = 'cd649bf376fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("nodes")


def downgrade() -> None:
    op.create_table(
        "nodes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scenario_id", sa.Integer(), sa.ForeignKey("scenarios.id")),
        sa.Column("external_id", sa.Integer()),
        sa.PrimaryKeyConstraint("id"),
    )
