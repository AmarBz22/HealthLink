import { useState, useRef, useEffect } from "react";
import { Bell, LayoutDashboard, ShoppingCart, Users, Package, Tag, FileText, Home, Wrench, Monitor } from "lucide-react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import logo from "../assets/logo1.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add logout loading state
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
  
        const response = await axios.get('http://192.168.43.102:8000/api/user', {
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
    setIsLoggingOut(true); // Start loading
    try {
      const authToken = localStorage.getItem("authToken");
      await axios.post(
        "http://192.168.43.102:8000/api/logout",
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
    } finally {
      setIsLoggingOut(false); // Stop loading
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
      <div className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm min-h-[60px]">
        {/* Left: Logo - Fixed to match normal state */}
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-sm flex items-center justify-center">
            <img src={logo} alt="" className="w-full h-full object-contain" />            
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
        
        {/* Store - For all logged in users, Admin goes to admin-stores */}
        <Link 
          to={userRole === 'Admin' ? "/admin-stores" : "/store"} 
          className="flex items-center space-x-1 group"
        >
          <ShoppingCart 
            className={`w-5 h-5 ${
              (isActive('/store') || isActive('/admin-stores')) 
                ? 'text-[#00796B]' 
                : 'text-gray-400 group-hover:text-[#00796B]'
            }`}
          />
          <span className={`text-sm ${
            (isActive('/store') || isActive('/admin-stores')) 
              ? 'text-[#00796B] font-medium' 
              : 'text-gray-500 group-hover:text-[#00796B]'
          }`}>
            Stores
          </span>
        </Link>

     
        
        {/* Orders - For all logged in users, but Admin goes to admin orders */}
        <Link 
          to={userRole === 'Admin' ? "/admin-orders" : "/orders"} 
          className="flex items-center space-x-1 group"
        >
          <FileText 
            className={`w-5 h-5 ${
              (isActive('/orders') || isActive('/admin-orders')) 
                ? 'text-[#00796B]' 
                : 'text-gray-400 group-hover:text-[#00796B]'
            }`}
          />
          <span className={`text-sm ${
            (isActive('/orders') || isActive('/admin-orders')) 
              ? 'text-[#00796B] font-medium' 
              : 'text-gray-500 group-hover:text-[#00796B]'
          }`}>
            Orders
          </span>
        </Link>
        
        {/* Products/Inventory - Admin goes to admin-products, all other users go to inventory-products */}
        {userRole === 'Admin' ? (
          <Link to="/admin-products" className="flex items-center space-x-1 group">
            <Tag 
              className={`w-5 h-5 ${
                isActive('/admin-products') 
                  ? 'text-[#00796B]' 
                  : 'text-gray-400 group-hover:text-[#00796B]'
              }`}
            />
            <span className={`text-sm ${
              isActive('/admin-products') 
                ? 'text-[#00796B] font-medium' 
                : 'text-gray-500 group-hover:text-[#00796B]'
            }`}>
              Products
            </span>
          </Link>
        ) : (
          /* Inventory - For all non-Admin users including Doctor and Dentist */
          <Link to="/inventory-products" className="flex items-center space-x-1 group">
            <Package 
              className={`w-5 h-5 ${
                isActive('/inventory-products') 
                  ? 'text-[#00796B]' 
                  : 'text-gray-400 group-hover:text-[#00796B]'
              }`}
            />
            <span className={`text-sm ${
              isActive('/inventory-products') 
                ? 'text-[#00796B] font-medium' 
                : 'text-gray-500 group-hover:text-[#00796B]'
            }`}>
              Inventory
            </span>
          </Link>
        )}
        
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
        
        {/* Used Equipment - Only for Doctor and Dentist */}
        {['Doctor', 'Dentist'].includes(userRole) && (
          <Link to="/used-equipment" className="flex items-center space-x-1 group">
            <Wrench 
              className={`w-5 h-5 ${isActive('/used-equipment') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
            />
            <span className={`text-sm ${isActive('/used-equipment') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
              Used Equipment
            </span>
          </Link>
        )}
           {/* Digital Products - For all logged in users */}
           <Link to="/digital-products" className="flex items-center space-x-1 group">
          <Monitor 
            className={`w-5 h-5 ${isActive('/digital-products') ? 'text-[#00796B]' : 'text-gray-400 group-hover:text-[#00796B]'}`}
          />
          <span className={`text-sm ${isActive('/digital-products') ? 'text-[#00796B] font-medium' : 'text-gray-500 group-hover:text-[#00796B]'}`}>
            Digital Products
          </span>
        </Link>
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm min-h-[60px]">
      {/* Left: Logo */}
      <div className="flex items-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-sm flex items-center justify-center">
          <img src={logo} alt="" className="w-full h-full object-contain" />            
        </div>
      </div>

      {/* Center: Navigation Items (from sidebar) - Only show for logged in users */}
      {isLoggedIn && renderNavigationItems()}

      {/* Right: Icons + Profile */}
      <div className="flex items-center gap-6">
        {/* Profile Picture/Guest Icon with Dropdown */}
        <div className="flex items-center space-x-4" ref={menuRef}>
          {isLoggedIn ? (
            <>
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover:border-[#00796B] transition-colors duration-200"
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
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className="text-gray-700 font-medium hover:text-[#00796B] transition-colors duration-200"
                >
                  {user?.first_name} {user?.last_name}
                </button>
                {user?.role && (
                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                )}
              </div>

              {/* Dropdown Menu for logged in users */}
              {isOpen && (
                <div className="absolute right-0 top-16 w-40 bg-white shadow-lg rounded-lg py-2 z-50 border border-gray-200">
                  <button 
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#00796B] transition-colors duration-200"
                    onClick={goToProfile}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#00796B] flex items-center justify-between transition-colors duration-200"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <span>Logout</span>
                    {isLoggingOut && (
                      <div className="w-4 h-4 border-2 border-t-2 border-[#00796B] border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            // Enhanced Guest User Display
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                <FiUser className="text-gray-500 text-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Guest User</span>
                <span className="text-xs text-gray-400">Not signed in</span>
              </div>
              <button 
                onClick={goToLogin}
                className="ml-2 bg-gradient-to-r from-[#00796B] to-[#00695C] text-white px-4 py-1.5 text-sm font-medium rounded-md hover:from-[#00695C] hover:to-[#004D40] transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
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