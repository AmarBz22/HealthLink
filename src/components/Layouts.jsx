import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Basket from "./Basket";
import { BasketProvider } from "../context/BasketContext";
import { FiShoppingCart } from "react-icons/fi";
import { useBasket } from "../context/BasketContext";

const Layout = () => {
  return (
    <BasketProvider>
      <div className="relative flex h-screen flex-col bg-gray-100">
        {/* Navbar (without any basket elements) */}
        <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white shadow-sm">
          <Navbar />
        </header>

        {/* Main Content */}
        <div className="flex flex-1 pt-16">
          {/* Sidebar (without basket elements) */}
          <aside className="fixed top-16 left-0 bottom-0 w-22 z-40 overflow-y-auto bg-white border-r border-gray-200">
            <Sidebar />
          </aside>

          {/* Content Area */}
          <main className="flex-1 ml-20 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 min-h-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Floating Cart Button (only basket UI element) */}
        <FloatingCartButton />
        
        {/* Basket Sidebar (appears when button clicked) */}
        <Basket />
      </div>
    </BasketProvider>
  );
};

// Floating Cart Button Component
const FloatingCartButton = () => {
  const { toggleBasket, totalItems } = useBasket();

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