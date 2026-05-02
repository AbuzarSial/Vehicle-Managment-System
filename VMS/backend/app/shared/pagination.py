"""Simple pagination helpers and types."""

from typing import NamedTuple


class Page(NamedTuple):
    items: list
    total: int
    page: int
    size: int


def paginate(queryset, page: int = 1, size: int = 20):
    """Placeholder paginator — expects list-like queryset for now."""
    total = len(queryset)
    start = (page - 1) * size
    end = start + size
    items = queryset[start:end]
    return Page(items=items, total=total, page=page, size=size)
