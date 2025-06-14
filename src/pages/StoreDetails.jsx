import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMapPin, FiPhone, FiMail, FiStar, FiEdit, FiX, FiUser, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddToCartModal from '../components/AddToCartModal';
import ProductsSection from '../components/ProductSection';
import InventoryConfirmationModal from '../components/InventroyConfirmationModal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [productToInventory, setProductToInventory] = useState(null);
  const [processingInventory, setProcessingInventory] = useState(false);
  const storageUrl = 'http://localhost:8000/storage';

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
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        };

        const [userResponse, storeResponse, productsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/user', { headers }),
          axios.get(`http://localhost:8000/api/store/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/products/${id}`, { headers }),
        ]);

        const userData = userResponse.data;
        const storeData = Array.isArray(storeResponse.data)
          ? storeResponse.data[0]
          : storeResponse.data?.data || storeResponse.data;

        if (!storeData) throw new Error('Store data not found');

        const fetchedProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : [];

        setCurrentUser(userData);
        setStore(storeData);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setIsOwner(userData?.id === storeData.owner_id);

        // Fetch owner information if owner_id is available
        if (storeData.owner_id) {
          try {
            const ownerResponse = await axios.get(`http://localhost:8000/api/users/${storeData.owner_id}`, { headers });
            setOwner(ownerResponse.data);
          } catch (ownerError) {
            console.error('Error fetching owner data:', ownerError);
          }
        }
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
  }, [id, navigate]);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (product) => {
    if (!product?.product_id) {
      console.error('Invalid product data');
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
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      await axios.delete(`http://localhost:8000/api/product/${productToDelete.product_id}`, { headers });

      const updatedProducts = products.filter((p) => p.product_id !== productToDelete.product_id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(product =>
        !searchTerm.trim() ||
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeletingProductId(null);
      setModalOpen(false);
    }
  };

  const handlePromoteClick = (product) => {
    if (!product?.product_id) {
      console.error('Invalid product data');
      return;
    }
    setProductToInventory(product);
    setInventoryModalOpen(true);
  };

  const handleConfirmInventory = async (inventoryPrice) => {
    if (!productToInventory?.product_id) return;

    try {
      setProcessingInventory(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      const response = await axios.post(
        'http://127.0.0.1:8000/api/products/stock-clearance',
        {
          store_product_id: productToInventory.product_id,
          inventory_price: parseFloat(inventoryPrice),
        },
        { headers }
      );

      const updatedProducts = products.filter((p) => p.product_id !== productToInventory.product_id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(product =>
        !searchTerm.trim() ||
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      toast.success('Product moved to inventory successfully');
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
    navigate('/checkout', { state: { products: [product] } });
  };

  const handleAddProduct = (type) => {
    if (currentUser?.role === 'Dentist' || currentUser?.role === 'Doctor') {
      navigate(`/store/${id}/addUsedEquipement`);
    } else {
      navigate(`/store/${id}/addProduct`);
    }
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
      <DeleteConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.product_name || ''}
      />
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
                  <FiUser className="mt-1 mr-3 text-[#00796B] flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Owner</h3>
                    <p className="text-gray-900">
                      {owner 
                        ? `${owner.first_name} ${owner.last_name}`
                        : 'Loading...'
                      }
                    </p>
                  </div>
                </div>
              </div>
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

      {/* Products Header with Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Products</h2>
            <div className="h-1 w-20 bg-[#00796B] rounded"></div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#00796B] focus:border-[#00796B] bg-white shadow-sm"
            />
          </div>
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found for "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Products Section */}
      <ProductsSection
        products={filteredProducts}
        isOwner={isOwner}
        storeId={id}
        userRole={currentUser?.role}
        deletingProductId={deletingProductId}
        processingInventory={processingInventory}
        storageUrl={storageUrl}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteClick}
        onEditProduct={(product) => navigate(`/store/${id}/products/${product.product_id}/edit`)}
        onPromoteProduct={handlePromoteClick}
        onAddToCart={(product) => {
          setSelectedProduct(product);
          setCartModalOpen(true);
        }}
      />
      
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