import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = ({ onSearch, onNavigate, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <nav className={`fixed w-full z-50 top-0 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-12 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-red-600 text-2xl md:text-3xl font-black tracking-wider cursor-pointer" onClick={() => onNavigate && onNavigate('home')}>
            PHIMNET
          </h1>
          <ul className="hidden md:flex gap-4 text-sm font-light text-gray-200">
            <li className={`cursor-pointer hover:text-gray-400 transition ${currentView === 'home' ? 'font-semibold text-white' : ''}`} onClick={() => onNavigate && onNavigate('home')}>Trang chủ</li>
            <li className="cursor-pointer hover:text-gray-400">Phim T.hình</li>
            <li className="cursor-pointer hover:text-gray-400">Phim lẻ</li>
            <li className="cursor-pointer hover:text-gray-400">Mới & Phổ biến</li>
            <li className={`cursor-pointer hover:text-gray-400 transition ${currentView === 'mylist' ? 'font-semibold text-white' : ''}`} onClick={() => onNavigate && onNavigate('mylist')}>Danh sách của tôi</li>
          </ul>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 text-white">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-black/50 border border-gray-600 rounded px-2 py-1">
            <Search className="w-5 h-5 text-gray-300" />
            <input 
              type="text" 
              placeholder="Tên phim..."
              className="bg-transparent border-none outline-none text-sm text-white px-2 w-24 md:w-48 transition-all focus:w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-400" />
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="User" className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
