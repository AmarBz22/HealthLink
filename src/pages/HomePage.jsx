import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Star, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Search,
  Shield,
  X,
  Filter,
  Heart,
  Pill,
  Stethoscope,
  TestTube,
  Activity,
  Plus,
  Thermometer
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import AddToCartModal from '../components/AddToCartModal';
import StoreCard from '../components/StoreCard';
import SearchComponent from '../components/SearchComponent';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [categories] = useState([
    { id: 1, name: 'Medical Equipment', icon: Stethoscope, color: 'from-teal-500 to-teal-600' },
    { id: 2, name: 'Pharmaceuticals', icon: Pill, color: 'from-teal-500 to-teal-600' },
    { id: 3, name: 'Personal Protective Equipment', icon: Shield, color: 'from-teal-500 to-teal-600' },
    { id: 4, name: 'Home Healthcare Devices', icon: Thermometer, color: 'from-teal-500 to-teal-600' },
    { id: 5, name: 'Health & Wellness', icon: Activity, color: 'from-teal-500 to-teal-600' },
    { id: 6, name: 'First Aid Supplies', icon: Plus, color: 'from-teal-500 to-teal-600' }
  ]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // New search-related state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('product_name');

  // Image search state
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [hasImageSearched, setHasImageSearched] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Scroll refs for horizontal scrolling
  const recommendedProductsRef = useRef(null);
  const allProductsRef = useRef(null);

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      setIsLoggedIn(!!token);
      setCurrentUserId(userId ? parseInt(userId) : null);
    };
    
    checkLoginStatus();
  }, []);
  
  // Helper function to safely parse JSON response
  const safeJsonParse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  };
  
  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products
        let productsData = [];
        try {
          const productsResponse = await fetch('http://192.168.43.101:8000/api/products');
          if (!productsResponse.ok) {
            throw new Error(`Products API returned ${productsResponse.status}: ${productsResponse.statusText}`);
          }
          productsData = await safeJsonParse(productsResponse);
          console.log('Successfully fetched products:', productsData.length);
        } catch (error) {
          console.error('Error fetching products:', error);
        }

        // Fetch recommendations (only if user is logged in)
        let recommendedData = [];
        if (isLoggedIn) {
          setRecommendationsLoading(true);
          try {
            const token = localStorage.getItem('authToken');
            const recommendationsResponse = await fetch('http://192.168.43.101:8000/api/recommendations', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (recommendationsResponse.ok) {
              const recommendationsResult = await safeJsonParse(recommendationsResponse);
              recommendedData = recommendationsResult.recommended_products || [];
              console.log('Successfully fetched recommendations:', recommendedData.length);
            }
          } catch (error) {
            console.error('Error fetching recommendations:', error);
          } finally {
            setRecommendationsLoading(false);
          }
        }
        
        // Fetch stores
        let storesData = [];
        try {
          const storesResponse = await fetch('http://192.168.43.101:8000/api/stores');
          if (!storesResponse.ok) {
            throw new Error(`Stores API returned ${storesResponse.status}: ${storesResponse.statusText}`);
          }
          storesData = await safeJsonParse(storesResponse);
          console.log('Successfully fetched stores:', storesData.length);
        } catch (error) {
          console.error('Error fetching stores:', error);
        }
        
        setFeaturedProducts(productsData);
        setRecommendedProducts(recommendedData);
        setTopStores(storesData);
        setLoading(false);
        
        if (productsData.length === 0 && storesData.length === 0) {
          console.warn('No data could be fetched from APIs. Please check your backend server.');
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setFeaturedProducts([]);
        setRecommendedProducts([]);
        setTopStores([]);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isLoggedIn]);

  // Handle image search results (limited to first 3 products)
  const handleImageSearchResults = (results) => {
    console.log('Image search results received:', results);
    setImageSearchResults(results.slice(0, 3)); // Limit to first 3 products
    setHasImageSearched(true);
    if (results && results.length > 0) {
      setSearchQuery('');
    }
  };

  // Search and filter logic using useMemo for performance
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...featuredProducts];
  
    if (hasImageSearched && imageSearchResults.length > 0) {
      // Map imageSearchResults IDs to their original indices to preserve order
      const imageResultIds = imageSearchResults.map(result => result.product_id || result.id);
      const idToIndex = new Map(imageResultIds.map((id, index) => [id, index]));
      filtered = filtered
        .filter(product => imageResultIds.includes(product.product_id || product.id))
        .sort((a, b) => idToIndex.get(a.product_id || a.id) - idToIndex.get(b.product_id || b.id));
    } else {
      // Apply text search, category, and price filters
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product => 
          product.product_name?.toLowerCase().includes(query) ||
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        );
      }
  
      if (selectedCategory) {
        const categoryName = categories.find(cat => cat.id === parseInt(selectedCategory))?.name;
        if (categoryName) {
          filtered = filtered.filter(product => 
            product.category?.toLowerCase().includes(categoryName.toLowerCase())
          );
        }
      }
  
      if (priceRange.min || priceRange.max) {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price || 0);
          const min = priceRange.min ? parseFloat(priceRange.min) : 0;
          const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
          return price >= min && price <= max;
        });
      }
  
      // Apply sorting for non-image searches
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
            return (a.product_name || a.name || '').localeCompare(b.product_name || b.name || '');
        }
      });
    }
  
    console.log('Filtered and sorted products:', filtered.map(p => p.product_id || p.id));
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
  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Event handlers
  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectAfter: '/home' } });
      return;
    }
    setSelectedProduct(product);
    setCartModalOpen(true);
  };
  
  const handleAddToBasket = (product) => {
    console.log('Adding to basket:', product);
    setCartItems(prev => {
      const existingItem = prev.find(item => (item.product_id || item.id) === (product.product_id || product.id));
      if (existingItem) {
        return prev.map(item => 
          (item.product_id || item.id) === (product.product_id || product.id)
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const handleOrderNow = (product) => {
    navigate('/checkout', { state: { products: [product] }});
  };
  
  const handleViewDetails = (product) => {
    navigate(`/products/${product.product_id || product.id}`);
  };

  const handleStoreDeleteSuccess = (deletedStoreId) => {
    setTopStores(prev => prev.filter(store => store.id !== deletedStoreId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Platform Introduction */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to HealthLink
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The trusted marketplace connecting healthcare providers with verified medical suppliers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F7FA] rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00796B] to-[#26A69A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
              <p className="text-gray-600">
                All suppliers undergo rigorous verification to ensure quality and reliability
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F7FA] rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00796B] to-[#26A69A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Streamlined Ordering</h3>
              <p className="text-gray-600">
                Simplify your procurement process with our easy-to-use platform
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F7FA] rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00796B] to-[#26A69A] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">
                Access wholesale prices directly from manufacturers and distributors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Component with Image Search */}
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
        <div className="relative">
          <button
            onClick={() => scrollLeft(allProductsRef)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scrollRight(allProductsRef)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div
            ref={allProductsRef}
            className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredAndSortedProducts.map((product, index) => (
              <div key={product.product_id || product.id} className="flex-none w-64 snap-start">
                <div className="relative">
                  {hasImageSearched && (
                    <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-[#00796B] to-[#26A69A] text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      #{index + 1} Match
                    </div>
                  )}
                  <ProductCard
                    product={product}
                    storageUrl="http://192.168.43.101:8000/storage"
                    onAddToCart={() => handleAddToCart(product)}
                    onViewDetails={() => handleViewDetails(product)}
                    className="h-full"
                    imageHeight="h-48"
                    isInCart={cartItems.some(item => (item.product_id || item.id) === (product.product_id || product.id))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              {hasImageSearched ? (
                <span className="text-3xl">📷</span>
              ) : (
                <Search className="w-10 h-10 text-gray-500" />
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
  // Default content

        <>
          {/* Featured Categories */}
          <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Our Categories
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 text-center border border-gray-100 transition-all duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => setSelectedCategory(category.id.toString())}
                    >
                      <div className={`h-20 w-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br ${category.color} shadow-lg`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Recommended Products */}
          {isLoggedIn && (
            <div className="py-12 bg-gray-50 relative">
              {recommendationsLoading ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recommended for You
                    </h2>
                  </div>
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
                  </div>
                </div>
              ) : recommendedProducts.length > 0 ? (
                <>
                  <button
                    onClick={() => scrollLeft(recommendedProductsRef)}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors shadow-lg z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => scrollRight(recommendedProductsRef)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors shadow-lg z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Recommended for You
                      </h2>
                    </div>
                    <div
                      ref={recommendedProductsRef}
                      className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {recommendedProducts.map((product) => (
                        <div key={product.product_id} className="flex-none w-64 snap-start">
                          <div className="relative">
                            <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-[#00796B] to-[#26A69A] text-white text-xs px-2 py-1 rounded-full shadow-lg">
                              ✨ Recommended
                            </div>
                            <ProductCard
                              product={product}
                              storageUrl="http://192.168.43.101:8000/storage"
                              onAddToCart={() => handleAddToCart(product)}
                              onViewDetails={() => handleViewDetails(product)}
                              className="h-full"
                              imageHeight="h-48"
                              isInCart={cartItems.some(item => (item.product_id || item.id) === product.product_id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recommended for You
                    </h2>
                  </div>
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Recommendations Yet
                      </h3>
                      <p className="text-gray-500 mb-6 leading-relaxed">
                        Build your recommendations by browsing or purchasing products
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* All Products */}
          <div className="py-12 bg-gray-50 relative">
            <button
              onClick={() => scrollLeft(allProductsRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollRight(allProductsRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-[#00796B] text-white rounded-full hover:bg-[#00695C] transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  All Products
                </h2>
              </div>
              
              {featuredProducts.length > 0 ? (
                <div
                  ref={allProductsRef}
                  className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {featuredProducts.map((product) => (
                    <div key={product.product_id} className="flex-none w-64 snap-start">
                      <ProductCard
                        product={product}
                        storageUrl="http://192.168.43.101:8000/storage"
                        onAddToCart={() => handleAddToCart(product)}
                        onViewDetails={() => handleViewDetails(product)}
                        className="h-full"
                        imageHeight="h-48"
                        isInCart={cartItems.some(item => item.product_id === product.product_id)}
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
          
          {/* Top Stores */}
          <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Trusted Suppliers
                </h2>
                <button
                  onClick={() => navigate('/store')}
                  className="flex items-center text-[#00796B] hover:underline"
                >
                  View All <ChevronRight className="ml-1 w-4 h-4" />
                </button>
              </div>
              
              {topStores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {topStores.slice(0, 8).map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      showDelete={false}
                      currentUserId={currentUserId}
                      onDeleteSuccess={handleStoreDeleteSuccess}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No stores available at the moment. Please check your backend server.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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

export default HomePage;