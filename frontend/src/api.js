import axios from 'axios';

// Cấu hình TMDB (Lấy từ biến môi trường .env)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const FASTAPI_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: FASTAPI_BASE_URL,
});

export const fetchPopularMovies = () => api.get('/movies/popular');
export const fetchRecommendations = (userId) => api.get(`/recommend?user_id=${userId}`);
export const fetchContentRecommendations = (movieId) => api.get(`/recommend/content?movie_id=${movieId}`);
export const searchMovies = (query) => api.get(`/movies/search?q=${query}`);

// Hàm gọi TMDB để lấy ảnh bìa (có cơ chế dự phòng tìm bằng tên phim)
export const fetchMoviePoster = async (tmdbId, title = "") => {
  // 1. Thử tìm bằng ID trước
  try {
    if (tmdbId && !isNaN(tmdbId)) {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
      if (res.data.poster_path) {
        return `https://image.tmdb.org/t/p/w500${res.data.poster_path}`;
      }
    }
  } catch (error) {
    // Nếu lỗi (ID sai hoặc bị xóa khỏi TMDB), chuyển sang bước 2
  }

  // 2. Nếu không có ID hoặc ID bị lỗi, thử tìm bằng Tên phim
  if (title) {
    try {
      // Dữ liệu MovieLens thường có dạng "Toy Story (1995)". Cần xóa bỏ phần năm (1995) để search cho chuẩn
      const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/g, '').trim();
      const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`);
      
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        // Trả về poster của kết quả giống nhất đầu tiên
        const firstResult = searchRes.data.results[0];
        if (firstResult.poster_path) {
          return `https://image.tmdb.org/t/p/w500${firstResult.poster_path}`;
        }
      }
    } catch (error) {
      console.error("Tìm kiếm tên phim thất bại:", title);
    }
  }
  
  return null;
};

// Hàm gọi TMDB để lấy ảnh nền (backdrop)
export const fetchMovieBackdrop = async (tmdbId, title = "") => {
  let targetTmdbId = tmdbId;
  if (!targetTmdbId || isNaN(targetTmdbId)) {
    if (!title) return null;
    try {
      const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/g, '').trim();
      const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`);
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        targetTmdbId = searchRes.data.results[0].id;
      }
    } catch (error) { return null; }
  }

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${targetTmdbId}?api_key=${TMDB_API_KEY}`);
    if (res.data.backdrop_path) {
      return `https://image.tmdb.org/t/p/original${res.data.backdrop_path}`;
    }
  } catch (error) {}
  return null;
};

// Hàm gọi TMDB để lấy trailer (YouTube key)
export const fetchMovieTrailer = async (tmdbId, title = "") => {
  let targetTmdbId = tmdbId;

  // 1. Nếu không có tmdbId, tìm kiếm bằng title trước để lấy tmdbId
  if (!targetTmdbId || isNaN(targetTmdbId)) {
    if (!title) return null;
    try {
      const cleanTitle = title.replace(/\s*\(\d{4}\)\s*/g, '').trim();
      const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`);
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        targetTmdbId = searchRes.data.results[0].id;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // 2. Lấy video list từ TMDB (Thử cả movie và tv nếu cần, nhưng tạm thời movie)
  try {
    const videoRes = await axios.get(`${TMDB_BASE_URL}/movie/${targetTmdbId}/videos?api_key=${TMDB_API_KEY}`);
    const videos = videoRes.data.results;
    
    // Ưu tiên: Trailer -> Teaser -> Clip
    const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
                    videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
                    videos.find(v => v.site === 'YouTube' && v.type === 'Clip');
                    
    return trailer ? trailer.key : null;
  } catch (error) {
    // Thử endpoint TV nếu Movie lỗi (phòng trường hợp ID là của TV series)
    try {
      const tvRes = await axios.get(`${TMDB_BASE_URL}/tv/${targetTmdbId}/videos?api_key=${TMDB_API_KEY}`);
      const tvVideos = tvRes.data.results;
      const tvTrailer = tvVideos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      return tvTrailer ? tvTrailer.key : null;
    } catch (e) {
      return null;
    }
  }
};

export default api;

