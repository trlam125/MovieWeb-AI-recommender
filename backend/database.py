from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL

# Khởi tạo engine kết nối tới MySQL
engine = create_engine(DATABASE_URL)

# Khởi tạo SessionLocal để tạo các phiên làm việc (session) với DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các model kế thừa
Base = declarative_base()

# Hàm tiện ích để FastAPI lấy session (Dependency)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
