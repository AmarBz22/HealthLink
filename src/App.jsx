import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import StoreManagementPage from "./pages/StoreManagementPage";
import StoreItemsPage from "./pages/StoreItems";
import AddProductPage from "./pages/AddProductPage";
import Layout from "./components/Layouts";
import SignupPage from "./pages/Singup";
import EditProfilePage from "./pages/EditProfile";
import StoreListingPage from "./pages/StoreList";
import StoreDetailsPage from "./pages/StoreDetails";
import EditProductPage from "./pages/EditProduct";
import UsersManagementPage from "./pages/UserManagementPage";
import EditStorePage from "./pages/EditStore";
import RegistrationConfirmation from "./pages/RegistrationConfiramtion";
import RegistrationRequestsPage from "./pages/RegistrationRequests";
import ProductPromotionPage from "./pages/ProductPromotion";
import OrderInformationPage from "./pages/OrderInformation";
import InventoryProductsPage from "./pages/InventoryProducts";
import NotFoundPage from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailsPage";
import UsedMedicalEquipmentPage from "./pages/UsedMedicalEquipement";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import HomePage from "./pages/HomePage";
import AddUsedEquipmentPage from "./pages/addUsedEquipement";
import AdminOrders from "./pages/AdminOrders";
import AdminStoreList from "./pages/AdminStoreList";
import AdminInventoryProducts from "./pages/AdminInventoryProducts";
import AdminProductList from "./pages/AdminProductList";
import DigitalProductsPage from "./pages/DigitalProduct";

// Custom hook to check authentication status
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });

        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
}

// ✅ AuthCheck for protected routes (redirects to login if not authenticated)
function AuthCheck({ children }) {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ✅ GuestCheck for public routes (redirects to dashboard if authenticated)
function GuestCheck({ children }) {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes - Only accessible when NOT authenticated */}
        <Route path="/login" element={<GuestCheck><LoginPage /></GuestCheck>} />
        <Route path="/signup" element={<GuestCheck><SignupPage /></GuestCheck>} />
        <Route path="/registration-confirmation" element={<GuestCheck><RegistrationConfirmation /></GuestCheck>} />
        <Route path="/landingPage" element={<GuestCheck><LandingPage /></GuestCheck>} />

        {/* ✅ Protected Routes - Only accessible when authenticated */}
        <Route
          path="/"
          element={
            <AuthCheck>
              <Layout />
            </AuthCheck>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="Home" element={<HomePage />} />

          <Route path="profile">
            <Route index element={<ProfilePage />} />
            <Route path="edit" element={<EditProfilePage />} />
          </Route>
          
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          <Route path="used-equipment" element={<UsedMedicalEquipmentPage />} />

          
          <Route path="store">
            <Route index element={<StoreListingPage />} />
            <Route path="add" element={<StoreManagementPage />} />
            <Route path=":id" element={<StoreDetailsPage />} />
            <Route path=":id/editStore" element={<EditStorePage />} />
            <Route path="items" element={<StoreItemsPage />} />
            <Route path=":id/addProduct" element={<AddProductPage />} />
            <Route path=":id/addUsedEquipement" element={<AddUsedEquipmentPage />} />

            <Route path=":storeId/products/:productId/edit" element={<EditProductPage />} />
            <Route path=":storeId/products/:productId" element={<ProductDetailsPage />} />
          </Route>
          
          <Route path="inventory-products" element={<InventoryProductsPage />} />
          
          
          
          <Route path="checkout" element={<CheckoutPage />} />
          
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="Admin-orders" element={<AdminOrders />} />
          <Route path="Admin-stores"  element={<AdminStoreList />}/>
          <Route path="Admin-inventory"  element={<AdminInventoryProducts />}/>
          <Route path="Admin-products"  element={<AdminProductList />}/>
          <Route path="Digital-Products"  element={<DigitalProductsPage />}/>



          <Route path="users">
            <Route index element={<UsersManagementPage />} />
            <Route path="registration-requests" element={<RegistrationRequestsPage />} />
          </Route>

          <Route path="order">
            <Route path="information" element={<OrderInformationPage />} />
          </Route>
        </Route>

        {/* ❌ Catch-all route: show NotFoundPage */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;