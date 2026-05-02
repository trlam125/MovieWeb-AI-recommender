import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieRow from './components/MovieRow';
import { fetchPopularMovies, fetchRecommendations, fetchMoviePoster, searchMovies } from './api';
import { Info, Play, Plus, Check, X } from 'lucide-react';
import MovieModal from './components/MovieModal';

const SearchMovieCard = ({ movie, onClick }) => {
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (movie.tmdbId || movie.title) {
      fetchMoviePoster(movie.tmdbId, movie.title).then(url => {
        if (isMounted && url) setPosterUrl(url);
      });
    }
    return () => { isMounted = false; };
  }, [movie.tmdbId]);

  return (
    <div className="cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => onClick(movie)}>
      <div className="aspect-[2/3] bg-[#181818] rounded overflow-hidden relative group shadow-lg">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-2 text-sm text-gray-400 border border-gray-700 rounded">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
          <h3 className="text-white text-xs font-bold truncate">{movie.title}</h3>
          <p className="text-gray-300 text-[10px] truncate">{movie.genres}</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [popular, setPopular] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroPoster, setHeroPoster] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [myList, setMyList] = useState(() => {
    try {
      const saved = localStorage.getItem('phimnet_mylist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  // Tạm thời hardcode User ID là 1 (có thể làm chức năng login sau)
  const currentUserId = 1;

  // Lưu myList vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('phimnet_mylist', JSON.stringify(myList));
  }, [myList]);

  const isInMyList = (movie) => {
    return myList.some(m => (m.movieId && m.movieId === movie.movieId) || (m.title && m.title === movie.title));
  };

  const toggleMyList = (movie) => {
    if (isInMyList(movie)) {
      setMyList(prev => prev.filter(m => !((m.movieId && m.movieId === movie.movieId) || (m.title && m.title === movie.title))));
    } else {
      setMyList(prev => [...prev, movie]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [popRes, recRes] = await Promise.all([
          fetchPopularMovies(),
          fetchRecommendations(currentUserId)
        ]);

        setPopular(popRes.data);
        setRecommendations(recRes.data);

        // Lấy 1 phim ngẫu nhiên từ popular làm Hero Banner
        if (popRes.data.length > 0) {
          const randomMovie = popRes.data[Math.floor(Math.random() * popRes.data.length)];
          setHeroMovie(randomMovie);
          const posterUrl = await fetchMoviePoster(randomMovie.tmdbId, randomMovie.title);
          setHeroPoster(posterUrl);
        }
      } catch (error) {
        console.error("Error fetching data from FastAPI:", error);
      }
    };
    loadData();
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchMovies(query);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSearchResults([]);
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-[#141414] min-h-screen text-white font-sans overflow-x-hidden">
      <Navbar onSearch={handleSearch} onNavigate={handleNavigate} currentView={currentView} />

      {/* Kết quả tìm kiếm (nếu có) */}
      {searchResults.length > 0 ? (
        <div className="pt-24 px-4 md:px-12">
          <h2 className="text-2xl font-bold mb-4">Kết quả tìm kiếm</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {searchResults.map(m => (
              <SearchMovieCard key={m.movieId} movie={m} onClick={handleMovieClick} />
            ))}
          </div>
          <button 
            className="mt-6 border border-gray-500 px-4 py-2 rounded hover:bg-white hover:text-black transition"
            onClick={() => setSearchResults([])}
          >
            Đóng tìm kiếm
          </button>
        </div>
      ) : currentView === 'mylist' ? (
        /* Trang Danh sách của tôi */
        <div className="pt-24 px-4 md:px-12 pb-12 min-h-screen">
          <h2 className="text-3xl font-bold mb-8">Danh sách của tôi</h2>
          {myList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {myList.map((movie, idx) => (
                <div key={movie.movieId || idx} className="relative group">
                  <SearchMovieCard movie={movie} onClick={handleMovieClick} />
                  <button
                    onClick={() => toggleMyList(movie)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 border border-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-red-600 hover:border-red-600 text-white"
                    title="Xóa khỏi danh sách"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <Plus className="w-16 h-16 mb-4 text-gray-600" />
              <p className="text-xl mb-2">Danh sách của bạn đang trống</p>
              <p className="text-sm text-gray-500">Thêm phim bằng cách nhấn nút + trên poster phim</p>
              <button 
                className="mt-6 px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition"
                onClick={() => handleNavigate('home')}
              >
                Khám phá phim
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          {heroMovie && (
            <div className="relative h-[70vh] md:h-[85vh] w-full">
              <div className="absolute inset-0">
                {heroPoster ? (
                  <img 
                    src={heroPoster}
                    alt={heroMovie.title}
                    className="w-full h-full object-cover object-center animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-[#141414] animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              
              <div className="absolute bottom-[20%] left-4 md:left-12 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
                  {heroMovie.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 font-medium mb-2 drop-shadow-md">
                  {heroMovie.genres}
                </p>
                <div className="flex gap-4 mt-6">
                  <button 
                    className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-white/80 transition cursor-pointer"
                    onClick={() => handleMovieClick(heroMovie)}
                  >
                    <Play className="w-6 h-6 fill-black" /> Phát
                  </button>
                  <button 
                    className="flex items-center gap-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-gray-500/50 transition cursor-pointer"
                    onClick={() => toggleMyList(heroMovie)}
                  >
                    {isInMyList(heroMovie) ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    {isInMyList(heroMovie) ? 'Đã thêm' : 'Danh sách'}
                  </button>
                  <button 
                    className="flex items-center gap-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-gray-500/50 transition cursor-pointer"
                    onClick={() => handleMovieClick(heroMovie)}
                  >
                    <Info className="w-6 h-6" /> Chi tiết
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Các dải phim */}
          <div className="pb-12 -mt-24 relative z-20">
            <MovieRow 
              title="Gợi ý thông minh cho bạn (Hybrid)" 
              movies={recommendations} 
              onMovieClick={handleMovieClick}
              myList={myList}
              onToggleMyList={toggleMyList}
              isInMyList={isInMyList}
            />
            <MovieRow 
              title="Phim đang thịnh hành (Popular)" 
              movies={popular} 
              onMovieClick={handleMovieClick}
              myList={myList}
              onToggleMyList={toggleMyList}
              isInMyList={isInMyList}
            />
          </div>
        </>
      )}

      {/* Hiển thị Modal nếu có phim được chọn */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={closeModal} 
          onMovieClick={handleMovieClick}
          isInMyList={isInMyList}
          onToggleMyList={toggleMyList}
        />
      )}
    </div>
  );
}

export default App;
