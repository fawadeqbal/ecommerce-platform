"""The search_products tool: published products with price, rating, stock and a link."""
from app.db.store import StoreRepository

SPEC = {
    "name": "search_products",
    "description": (
        "Search the store's products by name or keywords. Returns up to 5 products with price, currency, "
        "rating, whether they are in stock and a link. Use it when the customer asks if something is sold, "
        "available or in stock, what it costs, or wants a recommendation."
    ),
    "parameters": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Product name or keywords, e.g. wireless earbuds"}},
        "required": ["query"],
    },
}

_store = StoreRepository()


def run(arguments):
    rows = _store.search_products(str(arguments.get("query", ""))[:100])
    return {"products": rows} if rows else {"products": [], "note": "No matching products in the store."}
