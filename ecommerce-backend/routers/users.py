from fastapi import APIRouter, HTTPException, Header
from database import db
from models.user import UserRegister, UserLogin
from utils.auth import hash_password, verify_password, create_token, decode_token

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
def register(user: UserRegister):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    db.users.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user"
    })
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    found = db.users.find_one({"email": user.email})
    if not found or not verify_password(user.password, found["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({
        "id": str(found["_id"]),
        "email": found["email"],
        "role": found.get("role", "user")
    })
    return {"access_token": token, "token_type": "bearer", "role": found.get("role", "user")}

@router.post("/make-admin")
def make_admin(email: str, secret: str):
    if secret != "supersecret123":
        raise HTTPException(status_code=403, detail="Invalid secret")
    result = db.users.update_one({"email": email}, {"$set": {"role": "admin"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"{email} is now an admin"}

@router.get("/me")
def get_me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    try:
        data = decode_token(token)
        user = db.users.find_one({"email": data["email"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user")
        }
    except:
        raise HTTPException(status_code=401, detail="Invalid token")