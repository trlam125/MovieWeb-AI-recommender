# MovieWeb AI Recommender 🎬

An intelligent movie recommendation system built with a Hybrid Recommendation algorithm. The project combines the power of **FastAPI** on the backend, **React** on the frontend, and machine learning models to deliver an optimal user experience.

### 🌟 Key Features

- **AI-Powered Recommendation System:**
  - **Hybrid Model:** Combination of Collaborative Filtering (SVD) and Content-Based Filtering.
  - **Cold-start Handling:** Automatically falls back to Popularity-based recommendations for new users.
  - **Similar Movie Recommendations:** Discover movies with similar content based on genres and descriptions.
- **List Management (My List):**
  - Store favorite movies in a personal list (using LocalStorage).
- **Search & Discovery:**
  - Real-time movie title search.
  - Movie classification by popularity and rating.
  - Integrated YouTube trailers directly within the application.

### 🛠️ Tech Stack

#### Frontend
- **React 19** & **Vite**
- **Tailwind CSS**
- **Lucide React**: Elegant icon set.
- **Axios**: API request handling.

#### Backend
- **FastAPI**: High-performance Python web framework.
- **MySQL**: Relational database for movie and user data.
- **SQLAlchemy & PyMySQL**: ORM and DB connection driver.

#### AI & Data Science
- **Python**: Primary programming language.
- **Scikit-learn**: Content-Based processing (TF-IDF, Cosine Similarity).
- **Pandas & Numpy**: Large-scale data processing.
- **Joblib**: Model serialization and loading.

### 📂 Project Structure

```text
MovieWeb-AI-recommender/
├── ai_core/           # Training logic and AI models
│   ├── models.py      # Recommender class definitions
│   ├── train_model.py # Model training script
│   └── data_loader.py # Data loading from DB/CSV
├── backend/           # API Server (FastAPI)
│   ├── main.py        # API entry point
│   ├── database.py    # MySQL connection config
│   └── init_db.py     # Database initialization script
├── frontend/          # React application source
│   ├── src/
│   │   ├── components/# UI Components (MovieCard, Modal,...)
│   │   └── App.jsx    # Main Frontend logic
├── data/              # Dataset files (CSV)
└── artifacts/         # Trained model artifacts (.joblib)
```

### 📥 Data Setup & Model Training

#### 1. Download Dataset
The MovieLens 100k (Small) dataset is required for training.
- **Link:** [MovieLens Latest Small Dataset](https://files.grouplens.org/datasets/movielens/ml-latest-small.zip)
- **Instructions:** Download and extract the `.csv` files into the `data/` directory.

#### 2. Train the Model
To generate the `.joblib` recommendation model, run:
```bash
python ai_core/train_model.py
```
The trained model will be saved in the `artifacts/` folder.

### 🚀 Installation Guide

#### Prerequisites
- **Node.js** (version 18+)
- **Python** (version 3.9+)
- **MySQL Server**
- Website will run at: `http://localhost:5173`

### 📊 Training Results
The Hybrid model achieves a balance between highly personalized recommendations (SVD) and content relevance (Content-Based), effectively solving the data sparsity problem.



---




Một hệ thống gợi ý phim thông minh được xây dựng với thuật toán lai ghép (Hybrid Recommendation). Dự án kết hợp sức mạnh của **FastAPI** ở backend, **React** ở frontend và các mô hình học máy để mang lại trải nghiệm người dùng tối ưu.

### 🌟 Tính Năng Chính

- **Hệ Thống Gợi Ý Thông Minh (AI-Powered):**
  - **Hybrid Model:** Kết hợp giữa Collaborative Filtering (SVD) và Content-Based Filtering.
  - **Cold-start Handling:** Tự động chuyển sang gợi ý dựa trên độ phổ biến (Popularity-based) cho người dùng mới.
  - **Gợi ý phim tương tự:** Tìm kiếm các phim có nội dung tương đồng dựa trên thể loại và mô tả.
- **Quản Lý Danh Sách (My List):**
  - Lưu trữ phim yêu thích vào danh sách cá nhân (sử dụng LocalStorage).
- **Tìm Kiếm & Khám Phá:**
  - Tìm kiếm phim theo tiêu đề thời gian thực.
  - Phân loại phim theo mức độ thịnh hành và đánh giá.
  - Tích hợp trailer YouTube trực tiếp trong ứng dụng.

### 🛠️ Những gì đang có

#### Frontend
- **React 19** & **Vite**
- **Tailwind CSS**
- **Lucide React**: Bộ icon tinh tế.
- **Axios**: Xử lý gọi API.

#### Backend
- **FastAPI**: Framework web Python hiệu năng cao.
- **MySQL**: Cơ sở dữ liệu quan hệ lưu trữ thông tin phim và người dùng.
- **SQLAlchemy & PyMySQL**: ORM và driver kết nối DB.

#### AI & Data Science
- **Python**: Ngôn ngữ lập trình chính.
- **Scikit-learn**: Xử lý Content-Based (TF-IDF, Cosine Similarity).
- **Pandas & Numpy**: Xử lý dữ liệu quy mô lớn.
- **Joblib**: Lưu trữ và tải mô hình đã huấn luyện.

### 📂 Cấu Trúc Thư Mục

```text
MovieWeb-AI-recommender/
├── ai_core/           # Logic huấn luyện và các mô hình AI
│   ├── models.py      # Định nghĩa các lớp Recommender
│   ├── train_model.py # Script huấn luyện mô hình
│   └── data_loader.py # Xử lý nạp dữ liệu từ DB/CSV
├── backend/           # API Server (FastAPI)
│   ├── main.py        # Điểm khởi đầu của API
│   ├── database.py    # Cấu hình kết nối MySQL
│   └── init_db.py     # Script khởi tạo dữ liệu vào MySQL
├── frontend/          # Mã nguồn ứng dụng React
│   ├── src/
│   │   ├── components/# Các thành phần UI (MovieCard, Modal,...)
│   │   └── App.jsx    # Logic chính của Frontend
├── data/              # Chứa các file dataset (CSV)
└── artifacts/         # Chứa model đã huấn luyện (.joblib)
```

### 📥 Cài đặt Dữ liệu & Huấn luyện Mô hình

#### 1. Tải bộ dữ liệu
Dự án sử dụng bộ dữ liệu MovieLens 100k (phiên bản nhỏ).
- **Link tải:** [MovieLens Latest Small Dataset](https://files.grouplens.org/datasets/movielens/ml-latest-small.zip)
- **Hướng dẫn:** Tải xuống và giải nén các file `.csv` vào thư mục `data/`.

#### 2. Huấn luyện mô hình
Để tạo file mô hình gợi ý `.joblib`, chạy lệnh sau:
```bash
python ai_core/train_model.py
```
Mô hình sau khi huấn luyện sẽ được lưu vào thư mục `artifacts/`.

### 🚀 Hướng Dẫn Cài Đặt

#### Chuẩn bị môi trường
- **Node.js** (phiên bản 18+)
- **Python** (phiên bản 3.9+)
- **MySQL Server**
- Website sẽ chạy tại địa chỉ: `http://localhost:5173`

### 📊 Kết Quả Huấn Luyện
Mô hình Hybrid đạt được sự cân bằng giữa việc gợi ý các phim cá nhân hóa cao (SVD) và duy trì sự liên quan về nội dung (Content-Based), giúp giải quyết vấn đề dữ liệu thưa thớt (sparsity) hiệu quả.