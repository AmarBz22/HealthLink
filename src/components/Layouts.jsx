import { Outlet } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Basket from "./Basket";
import { BasketProvider } from "../context/BasketContext";
import { FiShoppingCart } from "react-icons/fi";
import { useBasket } from "../context/BasketContext";

// User Context
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User Provider Component
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
        
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`, // Adjust based on your auth setup
          'Content-Type': 'application/json'
        };

        const userResponse = await axios.get('http://192.168.43.102:8000/api/user', { headers });
        const currentUser = userResponse.data;
        
        setUser(currentUser);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

const Layout = () => {
  return (
    <UserProvider>
      <BasketProvider>
        <div className="relative flex h-screen flex-col bg-gray-100">
          {/* Navbar (now contains all navigation elements) */}
          <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white shadow-sm">
            <Navbar />
          </header>

          {/* Main Content (without sidebar) */}
          <div className="flex flex-1 pt-16">
            {/* Content Area (now takes full width) */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-6xl mx-auto p-6 min-h-full">
                <Outlet />
              </div>
            </main>
          </div>

          {/* Floating Cart Button - Only show for customers */}
          <FloatingCartButton />
          
          {/* Basket Sidebar (appears when button clicked) */}
          <Basket />
        </div>
      </BasketProvider>
    </UserProvider>
  );
};

// Floating Cart Button Component
const FloatingCartButton = () => {
  const { toggleBasket, totalItems } = useBasket();
  const { user, loading } = useUser();

  // Don't render while loading or if user is not available
  if (loading || !user) {
    return null;
  }

  // Define roles that cannot buy (non-customer roles)
  const nonBuyingRoles = ['Supplier', 'Admin'];
  
  // Don't render the button for non-buying roles
  if (nonBuyingRoles.includes(user.role)) {
    return null;
  }

  // Only show for customer roles: Dentist, Doctor, Labo, Pharmacist
  return (
    <button
      onClick={toggleBasket}
      className="fixed bottom-8 right-8 z-40 bg-[#00796B] text-white p-4 rounded-full shadow-lg hover:bg-[#00695C] transition-all flex items-center justify-center"
      aria-label="Shopping cart"
    >
      <FiShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default Layout;