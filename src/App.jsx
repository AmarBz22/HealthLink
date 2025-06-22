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
import AdminProductList from "./pages/AdminProductList";
import DigitalProductsPage from "./pages/DigitalProduct";
import EditUsedEquipmentPage from "./pages/EditUsedEquipement";
import AdminAddStore from "./pages/AddStoreAdmin";
import AddDigitalProduct from "./pages/AddDigitalProduct";
import EditDigitalProduct from "./pages/EditDigitalProduct";

// Custom hook to check authentication status and get user data
function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    user: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
          return;
        }

        const response = await fetch("http://192.168.43.101:8000/api/user", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthState({
            isAuthenticated: true,
            user: userData,
            loading: false
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          });
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
}

// ✅ AuthCheck for protected routes (redirects to login if not authenticated)
function AuthCheck({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ✅ GuestCheck for public routes (redirects based on role if authenticated)
function GuestCheck({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    // Redirect based on user role
    if (user.role === "Admin" || user.role === "Supplier") {
      return <Navigate to="/dashboard" replace />;
    } else {
      // For other roles (Doctor, etc.), redirect to home page
      return <Navigate to="/Home" replace />;
    }
  }

  return children;
}

// ✅ RoleBasedRedirect for authenticated users
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (user) {
    if (user.role === "Admin" || user.role === "Supplier") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/Home" replace />;
    }
  }

  // Fallback to dashboard if user data is not available yet
  return <Navigate to="/dashboard" replace />;
}

// ✅ DefaultRoute component handles the root route logic
function DefaultRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is not authenticated, show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // If user is authenticated, redirect based on role
  if (user) {
    if (user.role === "Admin" || user.role === "Supplier") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/Home" replace />;
    }
  }

  // Fallback
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Root route - Shows landing page for unauthenticated users, redirects authenticated users */}
        <Route path="/" element={<DefaultRoute />} />

        {/* ✅ Public Routes - Only accessible when NOT authenticated */}
        <Route path="/login" element={<GuestCheck><LoginPage /></GuestCheck>} />
        <Route path="/signup" element={<GuestCheck><SignupPage /></GuestCheck>} />
        <Route path="/registration-confirmation" element={<GuestCheck><RegistrationConfirmation /></GuestCheck>} />
        <Route path="/landingPage" element={<GuestCheck><LandingPage /></GuestCheck>} />

        {/* ✅ Protected Routes - Only accessible when authenticated */}
        <Route
          element={
            <AuthCheck>
              <Layout />
            </AuthCheck>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="Home" element={<HomePage />} />

          <Route path="profile">
            <Route index element={<ProfilePage />} />
            <Route path="edit" element={<EditProfilePage />} />
          </Route>
          
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          <Route path="used-equipment" element={<UsedMedicalEquipmentPage />} />
          <Route path="used-equipment/edit/:id" element={<EditUsedEquipmentPage />} />

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
          
          <Route path=":storeId/products/:productId/edit" element={<EditProductPage />} />

          <Route path="checkout" element={<CheckoutPage />} />
          
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="Admin-orders" element={<AdminOrders />} />
          <Route path="Admin-stores"  element={<AdminStoreList />}/>
          <Route path="Admin-addStore"  element={<AdminAddStore />}/>

          <Route path="Admin-products"  element={<AdminProductList />}/>
          <Route path="Digital-Products"  element={<DigitalProductsPage />}/>
          <Route path="add-Digital-Products"  element={<AddDigitalProduct />}/>
          <Route path="Digital-Products/edit/:id"  element={<EditDigitalProduct />}/>

          <Route path="users">
            <Route index element={<UsersManagementPage />} />
            <Route path="registration-requests" element={<RegistrationRequestsPage />} />
          </Route>

          <Route path="order">
            <Route path="information" element={<OrderInformationPage />} />
          </Route>
        </Route>

        {/* ✅ Legacy routes for backward compatibility - redirect to new structure */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/Home" element={<Navigate to="/app/Home" replace />} />

        {/* ❌ Catch-all route: show NotFoundPage */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;