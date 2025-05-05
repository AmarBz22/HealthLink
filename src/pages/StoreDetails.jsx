import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMapPin, FiPhone, FiMail, FiStar, FiEdit, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddToCartModal from '../components/AddToCartModal';
import ProductsSection from '../components/ProductSection';
import InventoryConfirmationModal from '../components/InventroyConfirmationModal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-opacity-50" onClick={onClose}></div>
      
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
  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // New state for inventory modal
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [productToInventory, setProductToInventory] = useState(null);
  const [processingInventory, setProcessingInventory] = useState(false);
  const storageUrl = 'http://localhost:8000/storage';
  const productType = "new"; // Set product type to "new"

  // Fetch store and product data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          toast.error('Please login to view this page');
          navigate('/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };

        const [userResponse, storeResponse, productsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/user', { headers }),
          axios.get(`http://localhost:8000/api/store/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/products/${id}`, { headers })
        ]);

        const storeData = Array.isArray(storeResponse.data) 
          ? storeResponse.data[0] 
          : storeResponse.data?.data || storeResponse.data;

        if (!storeData) throw new Error('Store data not found');

        // Filter products by type on the client side
        const filteredProducts = Array.isArray(productsResponse.data) 
          ? productsResponse.data.filter(product => product.type === productType)
          : [];

        setStore(storeData);
        setProducts(filteredProducts);
        setIsOwner(userResponse.data?.id === storeData.owner_id);

      } catch (error) {
        console.error('Error loading data:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
        toast.error(error.response?.data?.message || 'Failed to load store data');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate, productType]);

  const handleDeleteClick = (product) => {
    if (!product?.product_id) {
      console.error("Invalid product data");
      return;
    }
    setProductToDelete(product);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete?.product_id) return;

    try {
      setDeletingProductId(productToDelete.product_id);
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      await axios.delete(
        `http://localhost:8000/api/product/${productToDelete.product_id}`, 
        { headers }
      );

      setProducts(prev => prev.filter(p => p.product_id !== productToDelete.product_id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingProductId(null);
      setModalOpen(false);
    }
  };

  // New function to handle promote click
  const handlePromoteClick = (product) => {
    if (!product?.product_id) {
      console.error("Invalid product data");
      return;
    }
    setProductToInventory(product);
    setInventoryModalOpen(true);
  };

  // New function to confirm moving product to inventory
  const handleConfirmInventory = async () => {
    if (!productToInventory?.product_id) return;

    try {
      setProcessingInventory(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        'http://127.0.0.1:8000/api/products/stock-clearance',
        { store_product_id: productToInventory.product_id },
        { headers }
      );

      // Remove the product from the product list as it's moved to inventory
      setProducts(prev => prev.filter(p => p.product_id !== productToInventory.product_id));
      toast.success('Product moved to inventory successfully');
      
      // Optional: Log the response
      console.log('Inventory response:', response.data);
    } catch (error) {
      console.error('Inventory error:', error);
      toast.error(error.response?.data?.message || 'Failed to move product to inventory');
    } finally {
      setProcessingInventory(false);
      setInventoryModalOpen(false);
    }
  };

  const handleAddToBasket = (product) => {
    toast.success(`${product.product_name} added to basket`);
  };

  const handleOrderNow = (product) => {
    navigate('/checkout', { state: { products: [product] }});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
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

      {/* Inventory Confirmation Modal */}
      <InventoryConfirmationModal
        isOpen={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        onConfirm={handleConfirmInventory}
        productName={productToInventory?.product_name || ''}
      />

      {/* Store Info Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo */}
            <div className="w-32 h-32 flex-shrink-0 border-4 border-white rounded-xl shadow-md overflow-hidden bg-gray-100">
              {store?.logo_path ? (
                <img 
                  src={`${storageUrl}/${store.logo_path}`}
                  alt={`${store.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-store.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiShoppingCart size={40} />
                </div>
              )}
            </div>
            
            {/* Store Details */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{store.store_name}</h1>
                    {store?.is_verified === 1 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#B2DFDB] text-[#00796B]">
                        <FiStar className="mr-1" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{store.description}</p>
                </div>
                
                {isOwner && (
                  <button 
                    onClick={() => navigate(`/store/${store.id}/editStore`)}
                    className="flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
                  >
                    <FiEdit className="mr-2" /> Edit Store
                  </button>
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Products</h2>
        <div className="h-1 w-20 bg-[#00796B] rounded"></div>
      </div>

      {/* Products Section */}
      <ProductsSection
        products={products}
        isOwner={isOwner}
        storeId={id}
        deletingProductId={deletingProductId}
        processingInventory={processingInventory}
        storageUrl={storageUrl}
        onAddProduct={() => navigate(`/store/${id}/addProduct`)}
        onDeleteProduct={handleDeleteClick}
        onEditProduct={(product) => navigate(`/store/${id}/products/${product.product_id}/edit`)}
        onPromoteProduct={handlePromoteClick}
        onAddToCart={(product) => {
          setSelectedProduct(product);
          setCartModalOpen(true);
        }}
      />

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        product={selectedProduct}
        onAddToBasket={handleAddToBasket}
        onOrderNow={handleOrderNow}
      />
    </div>
  );
};

export default StoreDetailsPage;