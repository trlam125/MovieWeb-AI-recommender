import { useState, useEffect } from 'react';
import { fetchMoviePoster, fetchContentRecommendations, fetchMovieTrailer, fetchMovieBackdrop } from '../api';
import { X, Play, Plus, Check } from 'lucide-react';
import MovieCard from './MovieCard';

const SimilarMovieCard = ({ movie, onClick }) => {
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (movie.tmdbId || movie.title) {
      fetchMoviePoster(movie.tmdbId, movie.title).then(url => {
        if (isMounted && url) setPosterUrl(url);
      });
    }
    return () => { isMounted = false; };
  }, [movie]);

  return (
    <div
      className="bg-[#2f2f2f] rounded-lg overflow-hidden cursor-pointer hover:bg-[#404040] transition"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] bg-[#181818]">
        {posterUrl ? (
          <img
            src={posterUrl}
            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
            alt={movie.title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-b border-gray-700">
            <span className="text-gray-500 text-sm font-medium">{movie.title}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sm truncate">{movie.title}</h4>
        <p className="text-xs text-gray-400 mt-1 truncate">{movie.genres.replace(/\|/g, ', ')}</p>
      </div>
    </div>
  );
};

const MovieModal = ({ movie, onClose, onMovieClick, isInMyList, onToggleMyList }) => {
  const [posterUrl, setPosterUrl] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(true);
  const [backdropUrl, setBackdropUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trailerOverlayOpen, setTrailerOverlayOpen] = useState(false);

  useEffect(() => {
    // Ngăn cuộn trang nền khi mở Modal
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Cuộn Modal lên đầu khi phim thay đổi
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.scrollTop = 0;

    // Load poster
    if (movie.tmdbId || movie.title) {
      fetchMoviePoster(movie.tmdbId, movie.title).then(url => {
        if (isMounted && url) setPosterUrl(url);
      });
    } else {
      setPosterUrl(null);
    }

    // Load trailer & backdrop
    setIsPlaying(false);
    setTrailerOverlayOpen(false);
    setTrailerKey(null);
    setTrailerLoading(true);
    fetchMovieTrailer(movie.tmdbId, movie.title)
      .then(key => {
        if (isMounted) setTrailerKey(key);
      })
      .finally(() => {
        if (isMounted) setTrailerLoading(false);
      });
    fetchMovieBackdrop(movie.tmdbId, movie.title).then(url => {
      if (isMounted) setBackdropUrl(url);
    });

    // Load phim tương tự (Content-based AI)
    if (movie.movieId) {
      setLoadingSimilar(true);
      fetchContentRecommendations(movie.movieId)
        .then(res => {
          if (isMounted) setSimilarMovies(res.data);
        })
        .catch(err => console.error("Error fetching similar movies:", err))
        .finally(() => {
          if (isMounted) setLoadingSimilar(false);
        });
    }

    return () => { isMounted = false; };
  }, [movie]);

  useEffect(() => {
    if (!trailerOverlayOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setTrailerOverlayOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [trailerOverlayOpen]);

  if (!movie) return null;

  const handlePlayClick = () => {
    if (trailerKey) {
      setTrailerOverlayOpen(true);
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start overflow-y-auto bg-black/70 pt-10 pb-10">
      {/* Background click để đóng */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Nội dung Modal */}
      <div id="modal-content" className="relative w-full max-w-4xl bg-[#181818] rounded-lg shadow-2xl overflow-hidden z-10 animate-fade-in-up">

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative w-full h-[400px] bg-black">
          {isPlaying ? (
            <div className="absolute inset-0">
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#181818] p-10 text-center animate-fade-in">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
                  <Play className="w-8 h-8 opacity-40" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Trailer không khả dụng</h2>
                <p className="text-gray-400 max-w-md mb-6">Rất tiếc, chúng tôi không thể phát trực tiếp trailer cho phim này. Bạn có thể tìm thấy nó trên YouTube.</p>
                <button
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' trailer')}`, '_blank')}
                  className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Tìm trên YouTube
                </button>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 left-4 bg-black/60 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors z-20"
                title="Quay lại"
              >
                <Play className="w-5 h-5 rotate-180" />
              </button>
            </div>
          ) : (
            <>
              <div className="absolute inset-0">
                {backdropUrl || posterUrl ? (
                  <img
                    src={backdropUrl || posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center opacity-50 animate-fade-in"
                  />
                ) : (
                  <div className="w-full h-full bg-[#181818] animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-10 left-10">
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">{movie.title}</h1>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={trailerLoading}
                    className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded font-bold hover:bg-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    onClick={handlePlayClick}
                  >
                    <Play className="w-5 h-5 fill-black" /> {trailerLoading ? 'Đang tải…' : 'Phát'}
                  </button>
                  <button 
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition ${
                      isInMyList && isInMyList(movie) 
                        ? 'bg-white text-black border-2 border-white hover:bg-gray-200' 
                        : 'border-2 border-gray-400 text-white hover:border-white'
                    }`}
                    onClick={() => onToggleMyList && onToggleMyList(movie)}
                    title={isInMyList && isInMyList(movie) ? 'Xóa khỏi danh sách' : 'Thêm vào danh sách'}
                  >
                    {isInMyList && isInMyList(movie) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Thông tin chi tiết */}
        <div className="px-10 py-4 text-white">
          <div className="flex gap-4 items-center mb-6">
            <span className="text-green-500 font-semibold">Độ phù hợp: Mới</span>
            <span className="border border-gray-500 px-1 text-sm text-gray-300">HD</span>
          </div>
          <p className="text-gray-300 text-lg mb-2"><strong>Thể loại:</strong> {movie.genres.replace(/\|/g, ', ')}</p>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Đây là một bộ phim tuyệt vời thuộc thể loại {movie.genres.split('|')[0]}. Khám phá ngay để trải nghiệm những giây phút giải trí tuyệt đỉnh cùng PHIMNET.
          </p>

          {/* Phim tương tự */}
          <h3 className="text-2xl font-semibold mb-6">Phim tương tự</h3>
          {loadingSimilar ? (
            <div className="text-gray-400">Đang tìm phim tương tự...</div>
          ) : similarMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
              {similarMovies.map(m => (
                <SimilarMovieCard key={m.movieId} movie={m} onClick={onMovieClick} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 pb-10">Không tìm thấy phim tương tự nào.</div>
          )}
        </div>
      </div>

      {/* Trailer toàn cửa sổ trình duyệt (giống Netflix — iframe phủ 100% viewport) */}
      {trailerOverlayOpen && trailerKey && (
        <div
          className="fixed inset-0 z-[200] bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Trailer"
          onClick={() => setTrailerOverlayOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTrailerOverlayOpen(false);
            }}
            className="absolute top-4 right-4 z-[210] rounded-full bg-white/10 p-2 text-white hover:bg-white hover:text-black transition-colors"
            aria-label="Đóng trailer"
          >
            <X className="w-7 h-7" />
          </button>
          <div
            className="absolute inset-0"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`Trailer — ${movie.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieModal;
