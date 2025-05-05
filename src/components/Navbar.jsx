import { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiShoppingCart } from "react-icons/fi";
import { useBasket } from "../context/BasketContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { toggleBasket, totalItems } = useBasket();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
  
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        });
  
  
        // ✅ Update here: directly set response.data
        if (response.data) {
          setUser(response.data); // Set the whole user object
        } else {
          console.error('No user data found in the response.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);
  
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      localStorage.removeItem("authToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-[80px]">
        {/* Logo */}
        <div className="w-8 h-8 bg-[#00796B] rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-lg">▢</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center">
          <div className="flex items-center bg-gray-100 px-3 py-2 w-[300px]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search for transaction, item, etc"
              className="w-full bg-gray-100 text-sm text-gray-700 placeholder:text-gray-400 border-none outline-none"
            />
          </div>

          <button className="bg-[#00796B] text-white px-4 py-2 text-sm font-medium hover:bg-[#00695C]">
            Search
          </button>
        </div>
      </div>

      {/* Right: Icons + Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notification Icon */}
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#00796B]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
        </div>

        {/* Profile Picture with Clickable Dropdown */}
        <div className="flex items-center space-x-4" ref={menuRef}>
          <div className="relative">
            <Link to="/profile">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-gray-400 text-xl" />
                )}
              </div>
            </Link>
          </div>
          
          {user && (
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 font-medium">
              {user.first_name} {user.last_name}
            </button>
          )}

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg py-2 z-50 border border-gray-200">
              <button 
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#00796B]"
                onClick={goToProfile}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#00796B]"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;