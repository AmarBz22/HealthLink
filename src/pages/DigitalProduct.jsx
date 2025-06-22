import { useState, useEffect } from 'react';
import { FiExternalLink, FiShield, FiActivity, FiPackage, FiMessageCircle, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DigitalProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data from API
        const userResponse = await axios.get('http://192.168.43.101:8000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = userResponse.data;

        if (user) {
          setIsAuthenticated(true);
          // Check if the user's role is "Admin"
          setIsAdmin(user.role === 'Admin');
        } else {
          navigate('/login');
          return;
        }

        // Fetch digital products from API
        const productsResponse = await axios.get('http://192.168.43.101:8000/api/digital-products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle the response data structure
        const productsData = productsResponse.data.data || productsResponse.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
        
      } catch (error) {
        console.error('Failed to load user or products:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          setError('Failed to load products. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProducts();
  }, [navigate]);

  const handleDeleteProduct = async (product) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      
      await axios.delete(`http://192.168.43.101:8000/api/digital-products/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state to remove the deleted product
      setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id));
      
      console.log(`Product "${product.title}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product. Please try again.');
      // You might want to show an error toast/notification here
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const openDeleteModal = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  // Helper function to get the full URL for images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://192.168.43.101:8000/storage/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200/50">
          <div className="w-16 h-16 bg-[#00796B]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <FiShield className="w-8 h-8 text-[#00796B]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access our digital products.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-[#00796B] text-white rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 font-semibold hover:shadow-lg hover:-translate-y-0.5"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-[#00796B]/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#00796B]/20 mb-6">
              <div className="w-2 h-2 bg-[#00796B] rounded-full animate-pulse"></div>
              <span className="text-[#00796B] font-medium text-sm">Digital Solutions</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Digital Products for
              <span className="block text-[#00796B]">Operational Excellence</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Discover premium digital tools designed to enhance operational efficiency.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md border border-gray-200/50">
                <FiActivity className="text-[#00796B]"/>
                <span className="text-sm font-medium text-gray-700">Real-time Integration</span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => navigate('/add-Digital-Products')}
                  className="px-6 py-3 bg-[#00796B] text-white font-semibold rounded-xl hover:bg-[#00695C] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Add New Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">No digital products available at the moment.</p>
            {isAdmin && (
              <button
                onClick={() => navigate('/add-Digital-Products')}
                className="mt-6 px-6 py-3 bg-[#00796B] text-white font-semibold rounded-xl hover:bg-[#00695C] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(product.product_image) || 'https://picsum.photos/600/400?random=' + product.id}
                    alt={`${product.title} preview`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/600/400?random=' + product.id;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-6 left-6">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg">
                      <img
                        src={getImageUrl(product.logo) || 'https://picsum.photos/100/100?random=' + product.id}
                        alt="Company logo"
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/100/100?random=' + product.id;
                        }}
                      />
                    </div>
                  </div>

                  {/* Admin Controls Overlay */}
                  {isAdmin && (
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => navigate(`/Digital-Products/edit/${product.id}`)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all duration-200"
                        title="Edit Product"
                      >
                        <FiEdit className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="p-2 bg-red-500/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-red-600 transition-all duration-200"
                        title="Delete Product"
                      >
                        <FiTrash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#00796B] transition-colors">
                      {product.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-[#00796B] text-white font-semibold rounded-xl hover:bg-[#00695C] focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:ring-offset-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
                      >
                        <span>Explore Solution</span>
                        <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/Digital-Products/edit/${product.id}`)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-200"
                          >
                            <FiEdit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition-all duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center bg-gradient-to-r from-[#00796B] to-[#004D40] rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust our digital solutions to improve operational efficiency.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-white text-[#00796B] font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Schedule Demo
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
              Contact Sales
            </button>
            <a
              href="https://wa.me/+213696451116"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#20BA56] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <FiMessageCircle className="w-5 h-5" />
              Contact Us on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{deleteModal.product?.title}"</strong>? 
                This will permanently remove the product from your catalog.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteModal.product)}
                  disabled={deleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalProductsPage;