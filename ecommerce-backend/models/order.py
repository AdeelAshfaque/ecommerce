from pydantic import BaseModel
from typing import List, Optional

class OrderItem(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    items: List[OrderItem]
    shipping_address: str