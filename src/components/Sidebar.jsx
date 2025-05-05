import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  AlertCircle,
  LogOut,
  Package,
  Tag
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to determine if a path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      const authToken = localStorage.getItem("authToken");

      // Send the logout request with the authToken in the Authorization header
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Clear the token from localStorage
      localStorage.removeItem("authToken");

      // Redirect to the login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-20 bg-white flex flex-col items-center py-6 h-full overflow-hidden">
      {/* Navigation Icons */}
      <div className="flex flex-col gap-6 items-center">
        <Link to="/dashboard" className="relative group">
          <LayoutDashboard 
            className={`w-5 h-5 cursor-pointer ${
              isActive('/dashboard') ? 'text-[#00796B]' : 'text-gray-400 hover:text-[#00796B]'
            }`} 
          />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Dashboard
          </span>
        </Link>
        
        <Link to="/store" className="relative group">
          <ShoppingCart 
            className={`w-5 h-5 cursor-pointer ${
              isActive('/store') ? 'text-[#00796B]' : 'text-gray-400 hover:text-[#00796B]'
            }`}
          />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Store
          </span>
        </Link>
        
        {/* Inventory Button with Tag Icon */}
        <Link to="/inventory-products" className="relative group">
          <div className="relative">
            <Package 
              className={`w-5 h-5 cursor-pointer ${
                isActive('/inventory-products') ? 'text-[#00796B]' : 'text-gray-400 hover:text-[#00796B]'
              }`}
            />
            <Tag className="absolute -top-1 -right-2 w-3 h-3 text-[#00796B]" />
          </div>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Inventory
          </span>
        </Link>
        
        <Link to="/users" className="relative group">
          <ClipboardList 
            className={`w-5 h-5 cursor-pointer ${
              isActive('/users') ? 'text-[#00796B]' : 'text-gray-400 hover:text-[#00796B]'
            }`}
          />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Users
          </span>
        </Link>
      </div>

      <div className="flex-grow" />

      {/* Bottom Icons */}
      <div className="flex flex-col gap-6 items-center text-gray-400 pb-4">
        <div className="relative group">
          <AlertCircle className="w-5 h-5 hover:text-[#00796B] cursor-pointer" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Help
          </span>
        </div>
        <div className="relative group">
          <LogOut
            className="w-5 h-5 hover:text-[#00796B] cursor-pointer"
            onClick={handleLogout}
          />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;