import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import StoreManagementPage from "./pages/StoreManagementPage";
import StoreItemsPage from "./pages/StoreItems";
import AddProductPage from "./pages/AddProductPage";
import Layout from "./components/Layouts";
import SignupPage from "./pages/Singup";
import EditProfilePage from "./pages/EditProfile";
import { useEffect, useState } from "react";
import StoreListingPage from "./pages/StoreList";

// Auth Check Component
function AuthCheck({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });

        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or your loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/singup" element={<SignupPage />} />

        {/* Protected Routes */}
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
          
          <Route path="store">
            <Route index element={<StoreListingPage/>} />
            <Route path="add" element={<StoreManagementPage />} />
            <Route path="items" element={<StoreItemsPage />} />
            <Route path="items/add" element={<AddProductPage />} />
            <Route path="items/edit/:id" element={<AddProductPage />} />
          </Route>
        </Route>

        {/* Redirect all unmatched paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;