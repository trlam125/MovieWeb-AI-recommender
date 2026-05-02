import { useRef } from 'react';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieRow = ({ title, movies, onMovieClick, myList, onToggleMyList, isInMyList }) => {
  const rowRef = useRef(null);

  const handleClick = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-1 md:space-y-2 px-4 md:px-12 my-6">
      <h2 className="text-white font-semibold md:text-xl text-lg hover:text-gray-300 cursor-pointer transition">
        {title}
      </h2>
      
      <div className="relative group">
        <button 
          onClick={() => handleClick('left')}
          className="absolute left-0 top-0 bottom-0 w-12 bg-black/50 z-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div 
          ref={rowRef}
          className="flex items-center gap-2 md:gap-4 overflow-x-scroll scrollbar-hide py-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, idx) => (
            <MovieCard key={movie.id || idx} movie={movie} onClick={onMovieClick} isInMyList={isInMyList} onToggleMyList={onToggleMyList} />
          ))}
        </div>

        <button 
          onClick={() => handleClick('right')}
          className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 z-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
