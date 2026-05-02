import { useState, useEffect } from 'react';
import { fetchMoviePoster } from '../api';
import { Plus, Check } from 'lucide-react';

const MovieCard = ({ movie, onClick, isInMyList, onToggleMyList }) => {
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

  const fallbackImage = "https://via.placeholder.com/500x750/333333/FFFFFF?text=" + encodeURIComponent(movie.title);

  const inList = isInMyList ? isInMyList(movie) : false;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (onToggleMyList) onToggleMyList(movie);
  };

  return (
    <div 
      className="flex-none w-[140px] sm:w-[160px] md:w-[200px] cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-10 group"
      onClick={() => onClick && onClick(movie)}
    >
      <div className="relative rounded overflow-hidden shadow-lg aspect-[2/3]">
        <img 
          src={posterUrl || fallbackImage} 
          alt={movie.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
          <h3 className="text-white text-xs font-bold truncate">{movie.title}</h3>
          <p className="text-gray-300 text-[10px] truncate">{movie.genres}</p>
        </div>
        {/* Nút thêm/xóa khỏi Danh sách */}
        {onToggleMyList && (
          <button
            onClick={handleToggle}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 ${
              inList 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-black/60 text-white border border-gray-400 hover:border-white hover:bg-black/80'
            }`}
            title={inList ? 'Xóa khỏi danh sách' : 'Thêm vào danh sách'}
          >
            {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
