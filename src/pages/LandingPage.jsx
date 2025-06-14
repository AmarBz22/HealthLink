import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiChevronRight, 
  FiSearch, 
  FiShield, 
  FiShoppingCart, 
  FiTrendingUp 
} from 'react-icons/fi';
import axios from 'axios';

// Import components
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import HeroSection from '../components/HeroSection';
import FeaturedCategoriesSection from '../components/FeaturedCategories';
import SpecialOffersSection from '../components/SpecialOffers';
import GettingStartedSection from '../components/GettingStarted';
import SectionHeader from '../components/SectionHeader';
import ConnectionModal from '../components/ConnectionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchComponent from '../components/SearchComponent'; // Import SearchComponent
import AddToCartModal from '../components/AddToCartModal'; // Import AddToCartModal

const LandingPage = () => {
  const navigate = useNavigate();

  // State variables
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('product_name');
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [hasImageSearched, setHasImageSearched] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          };
          const userResponse = await axios.get('http://localhost:8000/api/user', { headers });
          const currentUser = userResponse.data;
          setCurrentUserId(currentUser.id);
          setCurrentUserRole(currentUser.role);
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            setIsLoggedIn(false);
            setCurrentUserId(null);
            setCurrentUserRole(null);
          }
        }
      }
    };

    checkLoginStatus();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : {};

        const productsResponse = await axios.get('http://localhost:8000/api/products', { headers });
        const storesResponse = await axios.get('http://localhost:8000/api/stores', { headers });

        const mockCategories = [
          { id: 1, name: 'Medications', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 2, name: 'Medical Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 3, name: 'Lab Supplies', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 4, name: 'Healthcare Devices', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 5, name: 'Personal Protective Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 6, name: 'Supplements', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
        ];

        const processedStores = (storesResponse.data || []).map((store) => ({
          id: store.id,
          owner_id: store.owner_id,
          name: store.store_name,
          description: store.description,
          phone: store.phone,
          email: store.email,
          address: store.address,
          logo_path: store.logo,
          is_verified: store.is_verified,
          specialties: store.specialties || ['Medical Equipment', 'Healthcare Devices'],
          isOwner: currentUserId ? store.owner_id === parseInt(currentUserId) : false,
        }));

        setFeaturedProducts(productsResponse.data || []);
        setTopStores(processedStores);
        setCategories(mockCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        fallbackToMockData();
      }
    };

    if (currentUserId !== null || !isLoggedIn) {
      fetchData();
    }
  }, [currentUserId, isLoggedIn]);

  // Fallback to mock data
  const fallbackToMockData = () => {
    const mockCategories = [
      { id: 1, name: 'Medications', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
      { id: 2, name: 'Medical Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
      { id: 3, name: 'Lab Supplies', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
      { id: 4, name: 'Healthcare Devices', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
      { id: 5, name: 'Personal Protective Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
      { id: 6, name: 'Supplements', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
    ];

    setCategories(mockCategories);
    setTopStores([]);
    setFeaturedProducts([]);
    setLoading(false);
  };

  // Handle image search results
  const handleImageSearchResults = (results) => {
    console.log('Image search results received:', results);
    setImageSearchResults(results);
    setHasImageSearched(true);

    if (results && results.length > 0) {
      setSearchQuery('');
    }
  };

  // Search and filter logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...featuredProducts];

    if (hasImageSearched && imageSearchResults.length > 0) {
      const imageResultIds = imageSearchResults.map((result) => result.product_id || result.id);
      filtered = filtered.filter((product) =>
        imageResultIds.includes(product.product_id || product.id)
      );
    }

    if (searchQuery.trim() && !hasImageSearched) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.product_name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      const categoryName = categories.find((cat) => cat.id === parseInt(selectedCategory))?.name;
      if (categoryName) {
        filtered = filtered.filter((product) =>
          product.category?.toLowerCase().includes(categoryName.toLowerCase())
        );
      }
    }

    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price || 0);
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price_desc':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'product_name':
        default:
          return (a.product_name || '').localeCompare(b.product_name || '');
      }
    });

    return filtered;
  }, [featuredProducts, searchQuery, selectedCategory, categories, priceRange, sortBy, imageSearchResults, hasImageSearched]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('product_name');
    setImageSearchResults([]);
    setHasImageSearched(false);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory || priceRange.min || priceRange.max || sortBy !== 'product_name' || hasImageSearched;

  // Event handlers
  const handleStoreClick = (store) => {
    if (isLoggedIn) {
      navigate(`/stores/${store.id}`);
    } else {
      setSelectedItem(store);
      setModalType('store');
      setShowModal(true);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const redirectToRegister = () => {
    navigate('/register');
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      setSelectedItem(product);
      setModalType('product');
      setShowModal(true);
      return;
    }

    setSelectedProduct(product);
    setCartModalOpen(true);
  };





  const handleViewDetails = (product) => {
    if (isLoggedIn) {
      navigate(`/products/${product.product_id}`);
    } else {
      setSelectedItem(product);
      setModalType('product');
      setShowModal(true);
    }
  };

  const handleStoreDeleteSuccess = (storeId) => {
    setTopStores((prevStores) => prevStores.filter((store) => store.id !== storeId));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <HeroSection />
      
      {/* Search Component */}
      <SearchComponent
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        filteredResultsCount={filteredAndSortedProducts.length}
        totalResultsCount={featuredProducts.length}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        showResultsSummary={true}
        onImageSearchResults={handleImageSearchResults}
        placeholder="Search for products by text or upload an image..."
        title="Find What You Need"
        subtitle="Search through thousands of medical products and supplies using text or image search"
      />

      {/* Search Results or Default Content */}
      {searchQuery || hasActiveFilters || hasImageSearched ? (
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {hasImageSearched && !searchQuery ? 'Image Search Results' : 'Search Results'}
              </h2>
              <div className="text-sm text-gray-600">
                {hasImageSearched && imageSearchResults.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 mr-2">
                    📷 Image Search Active
                  </span>
                )}
                {filteredAndSortedProducts.length} of {featuredProducts.length} products
              </div>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    isOwner={false}
                    storageUrl="http://localhost:8000/storage"
                    onAddToCart={() => handleAddToCart(product)}
                    onViewDetails={() => handleViewDetails(product)}
                    className="h-full bg-white rounded-xl shadow-xl border border-gray-200/50"
                    imageHeight="h-48"
                    isInCart={cartItems.some((item) => item.product_id === product.product_id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    {hasImageSearched ? (
                      <span className="text-3xl">📷</span>
                    ) : (
                      <FiSearch className="text-3xl text-gray-500" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {hasImageSearched ? 'No matching products found' : 'No products found'}
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    {hasImageSearched
                      ? "We couldn't find any products matching your uploaded image. Try uploading a different image or use text search instead."
                      : "We couldn't find any products matching your search criteria. Try adjusting your filters or search terms."
                    }
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-gradient-to-r from-[#00796B] to-[#26A69A] text-white font-medium rounded-xl hover:from-[#00695C] hover:to-[#00796B] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {hasImageSearched ? 'Clear Image Search' : 'Clear All Filters'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <FeaturedCategoriesSection
            categories={categories}
            onViewAllClick={() => navigate('/categories')}
            onCategoryClick={handleCategoryClick}
          />
          <SpecialOffersSection onViewAllClick={() => navigate('/offers')} />
          <div className="py-12 bg-white/60 backdrop-blur-sm border border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Popular Products" onViewAllClick={() => navigate('/products')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    isOwner={false}
                    storageUrl="http://localhost:8000/storage"
                    onAddToCart={() => handleAddToCart(product)}
                    onViewDetails={() => handleViewDetails(product)}
                    className="h-full bg-white rounded-xl shadow-xl border border-gray-200/50"
                    imageHeight="h-48"
                    isInCart={cartItems.some((item) => item.product_id === product.product_id)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="py-12 bg-gray-50/60 backdrop-blur-sm border border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Trusted Stores" onViewAllClick={() => navigate('/stores')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    currentUserId={currentUserId}
                    onDeleteSuccess={handleStoreDeleteSuccess}
                    className="bg-white rounded-xl shadow-xl border border-gray-200/50"
                  />
                ))}
              </div>
            </div>
          </div>
          <GettingStartedSection onCreateAccountClick={() => navigate('/register')} />
        </>
      )}

      <ConnectionModal
        showModal={showModal}
        modalType={modalType}
        selectedItem={selectedItem}
        onClose={closeModal}
        onLogin={redirectToLogin}
        onRegister={redirectToRegister}
      />
      
    </div>
  );
};

export default LandingPage;