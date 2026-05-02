import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_core.models import popularity_recommend, HybridRecommender
from config import TOP_N, POPULARITY_MIN_RATINGS

ARTIFACT_PATH = os.environ.get("TTCS_ARTIFACT_PATH", "artifacts/recommender.joblib")

# Biến toàn cục để lưu model sau khi load
app_data = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Chạy khi khởi động Server
    if os.path.exists(ARTIFACT_PATH):
        print(f"Loading model artifacts from {ARTIFACT_PATH}...")
        artifacts = joblib.load(ARTIFACT_PATH)
        app_data["model"] = artifacts.get("model")
        app_data["cb_model"] = artifacts.get("cb_model")
        app_data["popular_df"] = artifacts.get("popular_df")
        app_data["train_df"] = artifacts.get("train_df")
        app_data["movies_df"] = artifacts.get("movies_df")
        app_data["meta"] = artifacts.get("meta", {})
        
        # Khởi tạo HybridRecommender lai ghép SVD và Content-Based
        if app_data["model"] and app_data["cb_model"]:
            app_data["hybrid_model"] = HybridRecommender(app_data["model"], app_data["cb_model"], svd_weight=0.7)
            print("Hybrid model initialized!")
        else:
            app_data["hybrid_model"] = None

        print("Model loaded successfully!")
    else:
        print(f"Warning: Artifact not found at {ARTIFACT_PATH}. Please train the model first.")
        app_data["model"] = None
        
    yield  # Nhường quyền cho app chạy
    
    # Chạy khi tắt Server
    app_data.clear()

# Khởi tạo ứng dụng FastAPI với lifespan event
app = FastAPI(title="Movie Recommender API", lifespan=lifespan)

# Cấu hình CORS cho React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong production nên thay bằng ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Movie Recommender API. Go to /docs to test endpoints."}

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": app_data.get("model") is not None}

@app.get("/api/recommend", tags=["Recommendations"])
def recommend_movies(
    user_id: int = Query(..., description="ID của người dùng cần gợi ý phim"),
    top_n: int = Query(TOP_N, ge=1, le=50, description="Số lượng phim cần gợi ý")
):
    """
    Gợi ý phim cho người dùng dựa trên thuật toán Collaborative Filtering (SVD).
    Nếu là người dùng mới (chưa có trong dữ liệu huấn luyện), sẽ fallback về Popularity-based.
    """
    model = app_data.get("hybrid_model") or app_data.get("model")
    train_df = app_data.get("train_df")
    movies_df = app_data.get("movies_df")
    popular_df = app_data.get("popular_df")
    meta = app_data.get("meta", {})

    if not model:
        raise HTTPException(status_code=503, detail="Model chưa được huấn luyện hoặc không tìm thấy artifact.")

    # Thử gợi ý bằng mô hình SVD
    recs = model.recommend(user_id, top_n=top_n)

    if recs is None:
        # User mới (Cold-start) -> dùng Fallback popularity
        min_ratings = meta.get("popularity_min_ratings_default", POPULARITY_MIN_RATINGS)
        
        if train_df is not None and movies_df is not None:
            pop = popularity_recommend(
                train_df,
                movies_df,
                top_n=top_n,
                min_ratings=min_ratings,
            )
            show_df = pop
        elif isinstance(popular_df, pd.DataFrame):
            show_df = popular_df.head(top_n)
        else:
            raise HTTPException(status_code=500, detail="Không có dữ liệu Fallback Popularity.")
        
        # Chuyển đổi DataFrame thành list các dictionary để FastAPI trả về dạng JSON
        show_df["is_fallback"] = True
        
        # Đảm bảo handle NaN values cho JSON
        show_df = show_df.fillna("") 
        return show_df.to_dict(orient="records")

    # Nếu thành công (User cũ)
    recs["is_fallback"] = False
    recs = recs.fillna("") 
    return recs.to_dict(orient="records")

@app.get("/api/movies/popular", tags=["Movies"])
def get_popular_movies(limit: int = Query(20, ge=1, le=100)):
    popular_df = app_data.get("popular_df")
    if popular_df is None or popular_df.empty:
        raise HTTPException(status_code=503, detail="Không có dữ liệu phim thịnh hành.")
    
    # Lấy top phim
    res = popular_df.head(limit).copy()
    res = res.fillna("")
    return res.to_dict(orient="records")

@app.get("/api/movies/search", tags=["Movies"])
def search_movies(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100)):
    movies_df = app_data.get("movies_df")
    if movies_df is None or movies_df.empty:
        raise HTTPException(status_code=503, detail="Dữ liệu phim chưa sẵn sàng.")
    
    # Tìm kiếm không phân biệt hoa thường
    res = movies_df[movies_df['title'].str.contains(q, case=False, na=False)].head(limit).copy()
    res = res.fillna("")
    return res.to_dict(orient="records")

@app.get("/api/recommend/content", tags=["Recommendations"])
def recommend_similar_movies(movie_id: int = Query(...), top_n: int = Query(TOP_N, ge=1, le=50)):
    cb_model = app_data.get("cb_model")
    if not cb_model:
        raise HTTPException(status_code=503, detail="Content-Based Model chưa sẵn sàng.")
    
    try:
        recs = cb_model.recommend_similar(movie_id, top_n=top_n)
        if recs is None or recs.empty:
            return []
        recs = recs.fillna("")
        return recs.to_dict(orient="records")
    except ValueError as e:
        # Lỗi phim không tồn tại trong DB model
        raise HTTPException(status_code=404, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
