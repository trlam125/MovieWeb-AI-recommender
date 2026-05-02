import os
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env
load_dotenv()

RATINGS_PATH = "data/ratings.csv"
MOVIES_PATH = "data/movies.csv"
LINKS_PATH = "data/links.csv"

# MySQL Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/movie_recommender")

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")  # Điền API Key của TMDB vào file .env

TOP_N = 10

MIN_USER_RATINGS = 5
MIN_MOVIE_RATINGS = 5

N_COMPONENTS = 15
RANDOM_STATE = 42

NEGATIVE_SAMPLE_SIZE = 10
POPULARITY_MIN_RATINGS = 10

RUN_EVALUATION = False              # here
MAX_EVAL_USERS = 2000

# giới hạn số user khi evaluate để đỡ chậm
# MAX_EVAL_USERS = 500

'''
Khi cần lấy số liệu cho báo cáo
RUN_EVALUATION = True
'''