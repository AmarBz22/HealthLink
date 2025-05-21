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

// ✅ AuthCheck for protected routes
function AuthCheck({ children }) {
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

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/registration-confirmation" element={<RegistrationConfirmation />} />
        <Route path='landingPage' element={<LandingPage/>} />


        {/* ✅ Protected Routes */}
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

          <Route path="profile">
            <Route index element={<ProfilePage />} />
            <Route path="edit" element={<EditProfilePage />} />
          </Route>
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          <Route path="store">
            <Route index element={<StoreListingPage />} />
            <Route path="add" element={<StoreManagementPage />} />
            <Route path=":id" element={<StoreDetailsPage />} />
            <Route path=":id/editStore" element={<EditStorePage />} />
            <Route path="items" element={<StoreItemsPage />} />
            <Route path=":id/addProduct" element={<AddProductPage />} />
            <Route path=":storeId/products/:productId/edit" element={<EditProductPage />} />
            <Route path=":storeId/products/:productId" element={<ProductDetailsPage />} />


          </Route>
          <Route path="inventory-products" element={<InventoryProductsPage />} />
          <Route path="used-equipment" element={<UsedMedicalEquipmentPage/>} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />

          <Route path="users">
            <Route index element={<UsersManagementPage />} />
            <Route path="registration-requests" element={<RegistrationRequestsPage />} />
          </Route>

          <Route path="order">
            <Route path="information" element={<OrderInformationPage />} />
          </Route>
        </Route>

        {/* ❌ Catch-all route: show NotFoundPage instead of redirecting to login */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;