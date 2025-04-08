import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Settings,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Sidebar = () => {
  const navigate = useNavigate();

  
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
    <div className="w-20 bg-white flex flex-col items-center py-6 h-[calc(100vh-64px)]">
      {/* Navigation Icons */}
      <div className="flex flex-col gap-6 items-center text-gray-400">
        <LayoutDashboard className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
        <ShoppingCart className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
        <ClipboardList className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
        <Settings className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
      </div>

      <div className="flex-grow" />

      {/* Bottom Icons */}
      <div className="flex flex-col gap-6 items-center text-gray-400 pb-4">
        <AlertCircle className="w-5 h-5 hover:text-blue-500 cursor-pointer" />
        <LogOut
          className="w-5 h-5 hover:text-blue-500 cursor-pointer"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sidebar;
