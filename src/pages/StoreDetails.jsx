import { FiEdit, FiPlus, FiTrash2, FiShoppingCart, FiMapPin, FiPhone, FiMail, FiStar, FiShare2, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'small' }) => (
  <div className={`${size === 'small' ? 'h-4 w-4' : 'h-6 w-6'} animate-spin rounded-full border-2 border-current border-t-transparent`} />
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">"{productName}"</span>? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const StoreDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const storageUrl = 'http://localhost:8000/storage';

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const [storeResponse, productsResponse, userResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/stores/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/stores/${id}/products`, { headers }),
          axios.get(`http://localhost:8000/api/user`, { headers }).catch(() => null)
        ]);

        const storeData = storeResponse.data.data || storeResponse.data;
        setStore(storeData);
        setProducts(productsResponse.data.products || []);
        console.log(productsResponse);
        
        if (userResponse) {
          setIsOwner(storeData.owner_id === userResponse.data.id);
        }
      } catch (error) {
        console.error('API Error:', error);
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to load store data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate]);

  const handleDeleteClick = (product) => {
    if (!product || !product.product_id) {
      console.error("Invalid product or product ID is missing:", product);
      toast.error("Cannot delete product: Invalid product ID");
      return;
    }
    
    // Log the product ID to verify it's correct
    console.log("Product to delete ID:", product.product_id);
    
    setProductToDelete(product);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || !productToDelete.product_id) {
      console.error("Cannot delete: productToDelete or its ID is undefined", productToDelete);
      toast.error("Cannot delete: Invalid product ID");
      return;
    }
    
    try {
      setDeletingProductId(productToDelete.product_id);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
  
      console.log(`Attempting to delete product with ID: ${productToDelete.product_id}`);
      
      // Update the URL to use product_id
      const response = await axios.delete(
        `http://localhost:8000/api/products/${productToDelete.product_id}`, 
        { headers }
      );
      
      console.log('Delete response:', response);
      
      // Update the UI by removing the deleted product - also use product_id here
      setProducts(prevProducts => prevProducts.filter(p => p.product_id !== productToDelete.product_id));
      toast.success('Product deleted successfully');
      
      // Close the modal and reset states
      setModalOpen(false);
      setProductToDelete(null);
      setDeletingProductId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
      setDeletingProductId(null);
    }
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Store not found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.product_name || ''}
      />

      {/* Store Info Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo */}
            <div className="w-32 h-32 flex-shrink-0 border-4 border-white rounded-xl shadow-md overflow-hidden bg-gray-100">
              {!imageErrors['store-logo'] && store?.logo_path ? (
                <img 
                  src={`${storageUrl}/${store.logo_path}`}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError('store-logo')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiShoppingCart size={40} />
                </div>
              )}
            </div>
            
            {/* Store Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                    {store.is_verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#B2DFDB] text-[#00796B]">
                        <FiStar className="mr-1" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{store.description}</p>
                </div>
                
                {store.is_mine && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/store/${store.id}/editStore`)}
                      className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
                    >
                      <FiEdit className="mr-2" /> Edit Store
                    </button>
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <FiMapPin className="mt-1 mr-3 text-[#00796B] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-gray-900">{store.address || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiPhone className="mt-1 mr-3 text-[#00796B] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="text-gray-900">{store.phone || 'Not available'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMail className="mt-1 mr-3 text-[#00796B] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-gray-900">{store.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Specialties */}
              {store.specialties?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E0F2F1] text-[#00796B]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Products</h2>
            
            <div className="flex gap-3">
              <button 
                className="p-2 text-gray-500 hover:text-[#00796B] rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => toast.info('Share functionality coming soon!')}
              >
                <FiShare2 />
              </button>
              
              {store.is_mine && (
                <button 
                  onClick={() => navigate(`/store/${store.id}/addProduct`)}
                  className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
                >
                  <FiPlus className="mr-2" /> Add Product
                </button>
              )}
            </div>
          </div>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {products.map(product => (
              <div key={product.product_id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="h-56 bg-gray-100 flex items-center justify-center">
                  {!imageErrors[`product-${product.id}`] && product.image_path ? (
                    <img 
                      src={`${storageUrl}/${product.image_path}`}
                      alt={product.product_name}
                      className="h-full w-full object-cover"
                      onError={() => handleImageError(`product-${product.id}`)}
                    />
                  ) : (
                    <FiShoppingCart className="text-gray-400 text-4xl" />
                  )}
                </div>
                
                {/* Product Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.product_name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {product.stock} in stock
                    </span>
                  </div>
                  
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#00796B]">
                      ${!isNaN(Number(product.price)) ? Number(product.price).toFixed(2) : '0.00'}
                    </span>

                    <div className="flex gap-2">
                      <button 
                        className="p-2 bg-[#E0F2F1] text-[#00796B] rounded-lg hover:bg-[#B2DFDB] transition-colors"
                        onClick={() => toast.info('Add to cart functionality coming soon!')}
                      >
                        <FiShoppingCart />
                      </button>
                      
                      {store.is_mine && (
  <>
    <button 
      onClick={() => navigate(`/store/${store.id}/products/${product.product_id}/edit`)}
      className="p-2 bg-[#FFF8E1] text-[#FFA000] rounded-lg hover:bg-[#FFECB3] transition-colors"
    >
      <FiEdit />
    </button>
    <button 
      onClick={() => handleDeleteClick(product)}
      disabled={deletingProductId === product.product_id}
      className={`p-2 bg-[#FFEBEE] text-[#F44336] rounded-lg hover:bg-[#FFCDD2] transition-colors ${
        deletingProductId === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {deletingProductId === product.product_id ? (
        <Spinner size="small" />
      ) : (
        <FiTrash2 />
      )}
    </button>
  </>
)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FiShoppingCart className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-gray-500">
              {store.is_mine ? "Get started by adding your first product" : "This store hasn't added any products yet"}
            </p>
            {store.is_mine && (
              <div className="mt-6">
                <button 
                  onClick={() => navigate(`/store/${store.id}/addProduct`)}
                  className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
                >
                  <FiPlus className="mr-2" /> Add Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

StoreDetailsPage.propTypes = {
  // Add prop types if needed
};

export default StoreDetailsPage;