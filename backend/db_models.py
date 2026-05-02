from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)

    # Quan hệ 1-Nhiều với bảng Rating
    ratings = relationship("Rating", back_populates="user")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True) # Tương ứng movieId
    title = Column(String(255), index=True)
    genres = Column(String(255))
    tmdb_id = Column(Integer, index=True, nullable=True)

    # Quan hệ 1-Nhiều với bảng Rating
    ratings = relationship("Rating", back_populates="movie")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), index=True)
    rating = Column(Float)

    # Tham chiếu ngược lại User và Movie
    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")
