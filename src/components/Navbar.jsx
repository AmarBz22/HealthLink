import { useState, useRef, useEffect } from "react";
import { Bell, LayoutDashboard, ShoppingCart, Users, Package, Tag, FileText, Home, Wrench } from "lucide-react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiUser } from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Helper function to determine if a path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }
  
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        });
  
        if (response.data) {
          setUser(response.data);
          setIsLoggedIn(true);
        } else {
          console.error('No user data found in the response.');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
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
      setIsLoggedIn(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  // Show a minimal loading state while checking authentication
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm">
        {/* Left: Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[#00796B] rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg">▢</span>
          </div>
        </div>
        
        {/* Right: Loading indicator */}
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-t-2 border-[#00796B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determine which navigation items to show based on user role
  const renderNavigationItems = () => {
    if (!isLoggedIn || !user) return null;
    
    const userRole = user.role;
    
    return (
      <div className="flex items-center space-x-8">
        {/* Home - For all users except Admin & Supplier */}
        {userRole && userRole !== 'Admin' && userRole !== 'Supplier' && (
          <Link to="/home" className="flex items-center space-x-1 group">
            <Home 
              className={`w-5 h-5 ${isActive('/home') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`} 
            />
            <span className={`text-sm ${isActive('/home') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
              Home
            </span>
          </Link>
        )}
        
        {/* Dashboard - Only for Admin and Supplier */}
        {userRole && (userRole === 'Admin' || userRole === 'Supplier') && (
          <Link to="/dashboard" className="flex items-center space-x-1 group">
            <LayoutDashboard 
              className={`w-5 h-5 ${isActive('/dashboard') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`} 
            />
            <span className={`text-sm ${isActive('/dashboard') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
              Dashboard
            </span>
          </Link>
        )}
        
        {/* Store - For all logged in users */}
        <Link to="/store" className="flex items-center space-x-1 group">
          <ShoppingCart 
            className={`w-5 h-5 ${isActive('/store') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
          />
          <span className={`text-sm ${isActive('/store') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
            Store
          </span>
        </Link>
        
        {/* Orders - For all logged in users */}
        <Link to="/orders" className="flex items-center space-x-1 group">
          <FileText 
            className={`w-5 h-5 ${isActive('/orders') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
          />
          <span className={`text-sm ${isActive('/orders') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
            Orders
          </span>
        </Link>
        
        {/* Inventory - For all logged in users */}
        <Link to="/inventory-products" className="flex items-center space-x-1 group">
          <div className="relative">
            <Package 
              className={`w-5 h-5 ${isActive('/inventory-products') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
            />
            <Tag className="absolute -top-1 -right-2 w-3 h-3 text-[#00796B]" />
          </div>
          <span className={`text-sm ${isActive('/inventory-products') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
            Inventory
          </span>
        </Link>
        
        {/* Users - Only for Admin */}
        {userRole === 'Admin' && (
          <Link to="/users" className="flex items-center space-x-1 group">
            <Users 
              className={`w-5 h-5 ${isActive('/users') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
            />
            <span className={`text-sm ${isActive('/users') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
              Users
            </span>
          </Link>
        )}
        
        {/* Used Equipment - Only for Doctor */}
        {userRole === 'Doctor' && (
          <Link to="/used-equipment" className="flex items-center space-x-1 group">
            <Wrench 
              className={`w-5 h-5 ${isActive('/used-equipment') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
            />
            <span className={`text-sm ${isActive('/used-equipment') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
              Used Equipment
            </span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center">
        {/* Logo */}
        <div className="w-8 h-8 bg-[#00796B] rounded-sm flex items-center justify-center">
          <span className="text-white font-bold text-lg">▢</span>
        </div>
      </div>

      {/* Center: Navigation Items (from sidebar) - Only show for logged in users */}
      {isLoggedIn && renderNavigationItems()}

      {/* Right: Icons + Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notification Icon - Only show for logged in users */}
        {isLoggedIn && (
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#00796B]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </div>
        )}

        {/* Profile Picture/Guest Icon with Dropdown */}
        <div className="flex items-center space-x-4" ref={menuRef}>
          {isLoggedIn ? (
            <>
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {user?.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Profile image failed to load:", e.target.src);
                        // Fallback to default user icon
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center">
                            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <FiUser className="text-gray-400 text-xl" />
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 font-medium">
                  {user?.first_name} {user?.last_name}
                </button>
                {user?.role && (
                  <span className="text-xs text-gray-500">{user.role}</span>
                )}
              </div>

              {/* Dropdown Menu for logged in users */}
              {isOpen && (
                <div className="absolute right-0 top-16 w-40 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-200">
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
            </>
          ) : (
            // Guest User Display
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                <FiUser className="text-gray-400 text-xl" />
              </div>
              <span className="text-gray-700 font-medium">Guest</span>
              <button 
                onClick={goToLogin}
                className="ml-2 bg-[#00796B] text-white px-4 py-2 text-sm font-medium rounded hover:bg-[#00695C]"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;