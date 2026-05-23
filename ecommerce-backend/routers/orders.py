from fastapi import APIRouter, HTTPException
from database import db
from models.order import Order
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

def format_order(o):
    o["id"] = str(o["_id"])
    del o["_id"]
    return o

# Place an order
@router.post("/")
def place_order(order: Order):
    total = 0
    order_items = []

    for item in order.items:
        product = db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product['name']}")

        total += product["price"] * item.quantity
        order_items.append({
            "product_id": item.product_id,
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity
        })

        db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock": -item.quantity}}
        )

    result = db.orders.insert_one({
        "user_id": order.user_id,
        "guest_email": order.guest_email,
        "items": order_items,
        "shipping_address": order.shipping_address,
        "total_amount": total,
        "status": "pending",
        "created_at": datetime.utcnow()
    })

    return {"message": "Order placed successfully", "order_id": str(result.inserted_id), "total": total}

# Get all orders
@router.get("/")
def get_orders():
    orders = list(db.orders.find())
    return [format_order(o) for o in orders]

# Get orders by user
@router.get("/user/{user_id}")
def get_user_orders(user_id: str):
    orders = list(db.orders.find({"user_id": user_id}))
    return [format_order(o) for o in orders]

# Get single order
@router.get("/{order_id}")
def get_order(order_id: str):
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return format_order(order)

# Update order status
@router.put("/{order_id}/status")
def update_status(order_id: str, status: str):
    valid = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    result = db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": f"Order status updated to {status}"}