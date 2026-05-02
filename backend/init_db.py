import os
import sys
import pandas as pd
from sqlalchemy import text

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, SessionLocal
from backend.db_models import Base, User, Movie, Rating
from config import RATINGS_PATH, MOVIES_PATH, LINKS_PATH

def init_database():
    print("="*50)
    print("CẢNH BÁO: Quá trình này sẽ XÓA TOÀN BỘ dữ liệu hiện tại trong Database")
    print("và nạp lại dữ liệu mới từ các file CSV.")
    print("="*50)
    
    confirm = input("Bạn có chắc chắn muốn tiếp tục? (y/n): ")
    if confirm.lower() != 'y':
        print("Đã hủy quá trình khởi tạo Database.")
        sys.exit(0)

    print("\n1. Đang xóa (Drop) các bảng cũ và tạo lại bảng mới...")
    # Xóa toàn bộ bảng cũ và tạo lại dựa theo db_models.py
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Đã tạo xong các bảng: users, movies, ratings.")

    print("\n2. Đang đọc dữ liệu từ file CSV (quá trình này có thể mất thời gian do file lớn)...")
    try:
        # Load Movies & Links
        movies_df = pd.read_csv(MOVIES_PATH)
        links_df = pd.read_csv(LINKS_PATH)
        
        # Merge movies with links to get tmdbId
        movies_merged = movies_df.merge(links_df[['movieId', 'tmdbId']], on='movieId', how='left')
        
        # Rename columns to match the Movie model
        movies_merged = movies_merged.rename(columns={
            'movieId': 'id',
            'tmdbId': 'tmdb_id'
        })
        # Lọc ra các cột cần thiết
        movies_to_insert = movies_merged[['id', 'title', 'genres', 'tmdb_id']]

        # Load Ratings
        ratings_df = pd.read_csv(RATINGS_PATH)
        
        # Lấy danh sách các user duy nhất từ ratings
        unique_users = ratings_df['userId'].unique()
        users_to_insert = pd.DataFrame({
            'id': unique_users,
            'username': [f'User_{uid}' for uid in unique_users],
            'password_hash': None
        })

        # Chuẩn bị dữ liệu rating để insert
        ratings_to_insert = ratings_df.rename(columns={
            'userId': 'user_id',
            'movieId': 'movie_id'
        })[['user_id', 'movie_id', 'rating']]

        print("\n3. Đang chèn dữ liệu Users vào Database...")
        users_to_insert.to_sql(name='users', con=engine, if_exists='append', index=False, chunksize=50000)
        print(f"Đã chèn {len(users_to_insert)} users.")

        print("\n4. Đang chèn dữ liệu Movies vào Database...")
        movies_to_insert.to_sql(name='movies', con=engine, if_exists='append', index=False, chunksize=50000)
        print(f"Đã chèn {len(movies_to_insert)} movies.")

        print("\n5. Đang chèn dữ liệu Ratings vào Database (Vui lòng đợi, file rất lớn!)...")
        ratings_to_insert.to_sql(name='ratings', con=engine, if_exists='append', index=False, chunksize=50000)
        print(f"Đã chèn {len(ratings_to_insert)} ratings.")

        print("\nHOÀN TẤT! Dữ liệu đã được chuyển thành công vào MySQL.")
        
    except Exception as e:
        print(f"\nLỖI: {str(e)}")
        print("Vui lòng kiểm tra lại cấu hình kết nối Database trong config.py hoặc thông tin MySQL.")

if __name__ == "__main__":
    init_database()
