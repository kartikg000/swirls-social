from fastapi import FastAPI, Form, HTTPException, Depends, File, UploadFile
import os
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from starlette.requests import Request
from passlib.context import CryptContext
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MySQL connection string (update with your credentials)
SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:Kartik05@localhost:3306/swirl_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    age = Column(Integer, nullable=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(20))
    parent_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    relationship = Column(String(20), nullable=True)
    child_id = Column(Integer, nullable=True)

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    from_id = Column(Integer, ForeignKey('users.id'))
    to_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(20))

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('users.id'))
    receiver_id = Column(Integer, ForeignKey('users.id'))
    content = Column(Text)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user_name = Column(String(100))
    content = Column(Text)
    image_path = Column(String(255), nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register/child")
async def register_child(
    name: str = Form(...),
    age: int = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    proof: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(400, detail="Email already registered")
    user = User(
        name=name,
        age=age,
        email=email,
        password_hash=pwd_context.hash(password),
        role="child",
        parent_id=None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name}

@app.post("/register/parent")
async def register_parent(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    relationship: str = Form(...),
    child_id: int = Form(...),
    proof: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    user = User(
        name=name,
        email=email,
        password_hash=pwd_context.hash(password),
        role="parent",
        relationship=relationship,
        child_id=child_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    child = db.query(User).filter(User.id == child_id).first()
    if child:
        child.parent_id = user.id
        db.commit()

        # Make parent and child friends by default
        friend_request = FriendRequest(from_id=user.id, to_id=child_id, status="accepted")
        db.add(friend_request)
        db.commit()

    return {"id": user.id, "name": user.name}

@app.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"error": "User not found"}
    if not pwd_context.verify(password, user.password_hash):
        return {"error": "Incorrect password"}
    return {"id": user.id, "name": user.name, "role": user.role, "email": user.email}

@app.get("/users")
async def get_users(db: Session = Depends(get_db)):
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "parent_id": u.parent_id, "relationship": u.relationship, "child_id": u.child_id}
        for u in db.query(User).all()
    ]

@app.get("/friends/{user_id}")
async def get_friends(user_id: int, db: Session = Depends(get_db)):
    accepted = db.query(FriendRequest).filter(
        ((FriendRequest.from_id == user_id) | (FriendRequest.to_id == user_id)) & (FriendRequest.status == "accepted")
    ).all()
    friend_ids = [fr.to_id if fr.from_id == user_id else fr.from_id for fr in accepted]
    return [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role}
        for u in db.query(User).filter(User.id.in_(friend_ids)).all()
    ]

@app.post("/friend-request")
async def send_friend_request(from_id: int = Form(...), to_id: int = Form(...), db: Session = Depends(get_db)):
    exists = db.query(FriendRequest).filter(FriendRequest.from_id == from_id, FriendRequest.to_id == to_id).first()
    if exists:
        raise HTTPException(400, detail="Request already sent")
    fr = FriendRequest(from_id=from_id, to_id=to_id, status="pending")
    db.add(fr)
    db.commit()
    return {"detail": "Request sent"}

@app.post("/friend-request/accept")
async def accept_friend_request(from_id: int = Form(...), to_id: int = Form(...), db: Session = Depends(get_db)):
    fr = db.query(FriendRequest).filter(FriendRequest.from_id == from_id, FriendRequest.to_id == to_id).first()
    if fr:
        fr.status = "accepted"
        db.commit()
        return {"detail": "Accepted"}
    raise HTTPException(404, detail="Request not found")

@app.get("/friend-requests/{user_id}")
async def get_friend_requests(user_id: int, db: Session = Depends(get_db)):
    return [
        {"from_id": fr.from_id, "to_id": fr.to_id, "status": fr.status}
        for fr in db.query(FriendRequest).filter(FriendRequest.to_id == user_id, FriendRequest.status == "pending").all()
    ]

@app.post("/message")
async def send_message(sender_id: int = Form(...), receiver_id: int = Form(...), content: str = Form(...), db: Session = Depends(get_db)):
    msg = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
    db.add(msg)
    db.commit()
    return {"detail": "Message sent"}

@app.get("/messages")
async def get_messages(user1: int, user2: int, db: Session = Depends(get_db)):
    return [
        {"id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id, "content": m.content}
        for m in db.query(Message).filter(
            ((Message.sender_id == user1) & (Message.receiver_id == user2)) |
            ((Message.sender_id == user2) & (Message.receiver_id == user1))
        ).all()
    ]

@app.post("/posts")
async def create_post(
    user_id: int = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    import logging
    logging.warning(f"/posts called with user_id={user_id}, content={content}, image={image.filename if image else None}")
    user = db.query(User).filter(User.id == user_id).first()
    image_path = None
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"post_{user_id}_{user.name}_{image.filename}"
        save_path = os.path.join(UPLOAD_DIR, filename)
        try:
            logging.warning(f"Saving image to {save_path}")
            with open(save_path, "wb") as f:
                f.write(await image.read())
            image_path = f"uploads/{filename}"
            logging.warning(f"Image saved to {save_path}")
        except Exception as e:
            logging.error(f"Image upload failed: {e}")
            raise HTTPException(500, detail=f"Image upload failed: {e}")
    try:
        logging.warning(f"Creating Post object and adding to DB")
        post = Post(user_id=user_id, user_name=user.name if user else "Unknown", content=content, image_path=image_path)
        db.add(post)
        db.commit()
        logging.warning(f"Post committed to DB")
    except Exception as e:
        logging.error(f"DB error: {e}")
        raise HTTPException(500, detail=f"DB error: {e}")
    return {"detail": "Post created", "image_path": image_path}

@app.get("/uploads/{filename}")
def get_uploaded_file(filename: str, request: Request):
    filename = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return Response(status_code=404)
    response = FileResponse(file_path)
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
        response.headers["Content-Type"] = "image/*"
    elif filename.lower().endswith('.pdf'):
        response.headers["Content-Type"] = "application/pdf"
    return response

@app.get("/posts/{user_id}")
async def get_posts(user_id: int, db: Session = Depends(get_db)):
    accepted = db.query(FriendRequest).filter(
        ((FriendRequest.from_id == user_id) | (FriendRequest.to_id == user_id)) & (FriendRequest.status == "accepted")
    ).all()
    ids = set([user_id] + [fr.to_id if fr.from_id == user_id else fr.from_id for fr in accepted])
    return [
        {"id": p.id, "user_id": p.user_id, "user_name": p.user_name, "content": p.content, "image_path": p.image_path}
        for p in db.query(Post).filter(Post.user_id.in_(ids)).all()
    ]

@app.get("/messages/child/{parent_id}")
async def get_child_messages(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent or not parent.child_id:
        return []
    child_id = parent.child_id
    messages = db.query(Message).filter(
        (Message.sender_id == child_id) | (Message.receiver_id == child_id)
    ).all()
    return [
        {"id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id, "content": m.content}
        for m in messages
    ]

@app.get("/parent/child/messages/{parent_id}")
async def get_child_messages(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent or not parent.child_id:
        raise HTTPException(404, detail="Parent or child not found")
    child_id = parent.child_id
    messages = db.query(Message).filter(
        (Message.sender_id == child_id) | (Message.receiver_id == child_id)
    ).all()
    return [
        {"id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id, "content": m.content}
        for m in messages
    ]

@app.get("/parent/child/posts/{parent_id}")
async def get_child_posts(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent or not parent.child_id:
        raise HTTPException(404, detail="Parent or child not found")
    child_id = parent.child_id
    posts = db.query(Post).filter(Post.user_id == child_id).all()
    return [
        {"id": p.id, "user_id": p.user_id, "user_name": p.user_name, "content": p.content, "image_path": p.image_path}
        for p in posts
    ]

@app.get("/parent/child/friends/messages/{parent_id}")
async def get_child_friends_messages(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent or not parent.child_id:
        raise HTTPException(404, detail="Parent or child not found")
    child_id = parent.child_id

    # Get the child's friends
    accepted = db.query(FriendRequest).filter(
        ((FriendRequest.from_id == child_id) | (FriendRequest.to_id == child_id)) & (FriendRequest.status == "accepted")
    ).all()
    friend_ids = [fr.to_id if fr.from_id == child_id else fr.from_id for fr in accepted]

    # Get messages involving the child's friends
    messages = db.query(Message).filter(
        (Message.sender_id.in_(friend_ids)) | (Message.receiver_id.in_(friend_ids))
    ).all()

    return [
        {"id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id, "content": m.content}
        for m in messages
    ]

@app.get("/parent/child/friends/posts/{parent_id}")
async def get_child_friends_posts(parent_id: int, db: Session = Depends(get_db)):
    parent = db.query(User).filter(User.id == parent_id, User.role == "parent").first()
    if not parent or not parent.child_id:
        raise HTTPException(404, detail="Parent or child not found")
    child_id = parent.child_id

    # Get the child's friends
    accepted = db.query(FriendRequest).filter(
        ((FriendRequest.from_id == child_id) | (FriendRequest.to_id == child_id)) & (FriendRequest.status == "accepted")
    ).all()
    friend_ids = [fr.to_id if fr.from_id == child_id else fr.from_id for fr in accepted]

    # Get posts created by the child's friends
    posts = db.query(Post).filter(Post.user_id.in_(friend_ids)).all()

    return [
        {"id": p.id, "user_id": p.user_id, "user_name": p.user_name, "content": p.content, "image_path": p.image_path}
        for p in posts
    ]
