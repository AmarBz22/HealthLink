import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiChevronRight, 
  FiChevronLeft,
  FiSearch, 
  FiShield, 
  FiShoppingCart, 
  FiTrendingUp,
  FiCheck,
  FiStar,
  FiUsers,
  FiCreditCard,
  FiGift
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
import SearchComponent from '../components/SearchComponent';
import AddToCartModal from '../components/AddToCartModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuredProductsRef = useRef(null);

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
          const userResponse = await axios.get('http://192.168.43.101:8000/api/user', { headers });
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

  // Fetch owner information for a store
  const fetchOwnerInfo = async (ownerId, headers) => {
    try {
      const ownerResponse = await axios.get(`http://192.168.43.101:8000/api/users/${ownerId}`, { headers });
      return ownerResponse.data;
    } catch (error) {
      console.error(`Error fetching owner data for ID ${ownerId}:`, error);
      return null;
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : {};

        const productsResponse = await axios.get('http://192.168.43.101:8000/api/products', { headers });
        const storesResponse = await axios.get('http://192.168.43.101:8000/api/stores', { headers });

        const mockCategories = [
          { id: 1, name: 'Medications', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 2, name: 'Medical Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 3, name: 'Lab Supplies', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 4, name: 'Healthcare Devices', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 5, name: 'Personal Protective Equipment', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
          { id: 6, name: 'Supplements', icon: <FiPackage className="text-[#00796B] h-6 w-6" />, image: '/api/placeholder/150/150' },
        ];

        // Process stores with owner information
        const processedStores = await Promise.all(
          (storesResponse.data || []).map(async (store) => {
            let owner = null;
            
            // Fetch owner information if owner_id exists and user is logged in
            if (store.owner_id && token) {
              owner = await fetchOwnerInfo(store.owner_id, headers);
            }

            return {
              id: store.id,
              owner_id: store.owner_id,
              store_name: store.store_name,
              description: store.description,
              phone: store.phone,
              address: store.address,
              logo_path: store.logo_path,
              specialties: store.specialties || [],
              isOwner: currentUserId ? store.owner_id === parseInt(currentUserId) : false,
              owner: owner ? {
                first_name: owner.first_name,
                last_name: owner.last_name,
                email: owner.email
              } : null
            };
          })
        );

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

  // Scroll handler functions
  const scrollLeft = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

  const handleStoreViewDetails = (store) => {
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
    setModalType('');
  };

  const redirectToLogin = () => {
    setShowModal(false);
    navigate('/login');
  };

  const redirectToRegister = () => {
    setShowModal(false);
    navigate('/signup');
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
                    storageUrl="http://192.168.43.101:8000/storage"
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
          <SpecialOffersSection  />
          <div className="py-12 bg-white/60 backdrop-blur-sm border border-gray-200/50 relative">
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
            >
              <FiChevronLeft className="text-xl" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
            >
              <FiChevronRight className="text-xl" />
            </button>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Popular Products" />
              {featuredProducts.length > 0 ? (
                <div
                  ref={featuredProductsRef}
                  className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {featuredProducts.slice(0, 8).map((product) => (
                    <div key={product.product_id} className="flex-none w-64 snap-start">
                      <ProductCard
                        product={product}
                        isOwner={false}
                        storageUrl="http://192.168.43.101:8000/storage"
                        onAddToCart={() => handleAddToCart(product)}
                        onViewDetails={() => handleViewDetails(product)}
                        className="h-full bg-white rounded-xl shadow-xl border border-gray-200/50"
                        imageHeight="h-48"
                        isInCart={cartItems.some((item) => item.product_id === product.product_id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products available at the moment. Please check your backend server.</p>
                </div>
              )}
            </div>
          </div>
          <div className="py-12 bg-gray-50/60 backdrop-blur-sm border border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader title="Trusted Stores" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    showDelete={true}
                    currentUserId={currentUserId}
                    onDeleteSuccess={handleStoreDeleteSuccess}
                    storageUrl="http://192.168.43.101:8000/storage"
                    className="bg-white rounded-xl shadow-xl border border-gray-200/50"
                  />
                ))}
              </div>
            </div>
          </div>
          <GettingStartedSection onCreateAccountClick={() => navigate('/signup')} />
        </>
      )}

      {/* Subscription Information Section */}
      <div className="py-16 bg-gradient-to-br from-[#00796B] to-[#004D40] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Join our platform with flexible pricing designed for healthcare professionals and suppliers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Suppliers Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingCart className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Suppliers</h3>
                <p className="text-teal-100">For medical product suppliers</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FiGift className="text-2xl text-green-400 mr-2" />
                      <span className="text-lg font-semibold text-green-400">3 Months FREE</span>
                    </div>
                    <div className="text-3xl font-bold">2,000 DZD</div>
                    <div className="text-teal-200">per month after trial</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>List unlimited products</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Store management dashboard</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Order management system</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Analytics and reporting</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Customer support</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/signup')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Free Trial
              </button>
            </div>

            {/* Healthcare Professionals Plan */}
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <FiStar className="mr-1" />
                  Most Popular
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Healthcare Professionals</h3>
                <p className="text-teal-100">For doctors and dentists</p>
              </div>
              
              <div className="mb-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400 mb-2">FREE</div>
                  <div className="text-teal-200">Forever</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Browse all products</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Place orders directly</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Image search functionality</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Advanced filtering options</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Special discounts & offers</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/signup')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
            </div>

            {/* Digital Products Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Digital Products</h3>
                <p className="text-teal-100">Software & digital solutions</p>
              </div>
              
              <div className="mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">20%</div>
                  <div className="text-teal-200">commission per sale</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Product showcase on platform</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Direct client connections</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Cash-based transactions</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>20% commission per sale</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>Marketing & promotion support</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="text-green-400 mr-3 flex-shrink-0" />
                  <span>No online payment processing</span>
                </div>
              </div>

              <button 
                onClick={() => window.open('https://wa.me/213696451116?text=Hello! I\'m interested in collaborating with your platform to sell digital products. I\'d like to discuss the 20% commission partnership program.', '_blank')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Collaboration
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 max-w-4xl mx-auto border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Why Choose Our Platform?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center justify-center">
                  <FiShield className="text-green-400 mr-2" />
                  <span>Secure platform and data protection</span>
                </div>
                <div className="flex items-center justify-center">
                  <FiTrendingUp className="text-blue-400 mr-2" />
                  <span>Growing network of healthcare professionals</span>
                </div>
                <div className="flex items-center justify-center">
                  <FiUsers className="text-purple-400 mr-2" />
                  <span>Direct connections and collaborations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 text-center">
            <p className="text-teal-100 mb-2">Need help choosing the right plan?</p>
            <button 
              onClick={() => window.open('https://wa.me/213696451116?text=Hello!')}
              className="text-white underline hover:text-teal-200 transition-colors font-medium"
            >
              Contact our team for personalized assistance
            </button>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        showModal={showModal}
        modalType={modalType}
        selectedItem={selectedItem}
        onClose={closeModal}
        onLogin={redirectToLogin}
        onRegister={redirectToRegister}
      />

      {/* Add to Cart Modal */}
      {cartModalOpen && selectedProduct && (
        <AddToCartModal
          product={selectedProduct}
          isOpen={cartModalOpen}
          onClose={() => {
            setCartModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product, quantity) => {
            console.log('Adding to cart:', product, quantity);
            setCartModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default LandingPage;