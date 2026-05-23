from fastapi import APIRouter, HTTPException, Header
from database import db
from models.product import Product
from utils.auth import decode_token
from bson import ObjectId

router = APIRouter(prefix="/products", tags=["Products"])

def format_product(p):
    p["id"] = str(p["_id"])
    del p["_id"]
    return p

def verify_admin(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    try:
        data = decode_token(token)
        if data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return data
    except HTTPException:
        raise
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Get all products - public
@router.get("/")
def get_products():
    products = list(db.products.find())
    return [format_product(p) for p in products]

# Search products - public
@router.get("/search/{keyword}")
def search_products(keyword: str):
    products = list(db.products.find({
        "$or": [
            {"name": {"$regex": keyword, "$options": "i"}},
            {"category": {"$regex": keyword, "$options": "i"}}
        ]
    }))
    return [format_product(p) for p in products]

# Get single product - public
@router.get("/{product_id}")
def get_product(product_id: str):
    product = db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product(product)

# Add product - admin only
@router.post("/")
def add_product(product: Product, authorization: str = Header(None)):
    verify_admin(authorization)
    result = db.products.insert_one(product.dict())
    return {"message": "Product added", "id": str(result.inserted_id)}

# Update product - admin only
@router.put("/{product_id}")
def update_product(product_id: str, product: Product, authorization: str = Header(None)):
    verify_admin(authorization)
    result = db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

# Delete product - admin only
@router.delete("/{product_id}")
def delete_product(product_id: str, authorization: str = Header(None)):
    verify_admin(authorization)
    result = db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}