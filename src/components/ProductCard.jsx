import { useState, useEffect, useMemo } from 'react';
import { 
  FiShoppingCart, 
  FiEdit, 
  FiTrash2, 
  FiBox, 
  FiChevronLeft, 
  FiChevronRight, 
  FiEye,
  FiStar,
  FiUser
} from 'react-icons/fi';

const ProductCard = ({
  product,
  isOwner = false,
  storageUrl = '',
  deletingProductId = null,
  processingInventory = null,
  onDeleteProduct = () => {},
  onEditProduct = () => {},
  onPromoteProduct = () => {},
  onAddToCart = () => {},
  onRateProduct = () => {},
  onViewDetails = () => {},
  className = '',
  imageHeight = 'h-48',
  showInventoryPrice = false,
  averageRating = 0,
  totalRatings = 0,
  isInCart = false,
  showTrending = false,
  // New props for optimization
  userInfo = null, // Pass user info to avoid repeated localStorage calls
  skipOwnershipCheck = false, // Skip ownership check when we already know
  preloadedRating = null // Pass preloaded rating data
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [verifiedOwnership, setVerifiedOwnership] = useState(null);
  const [productRating, setProductRating] = useState({ 
    average: preloadedRating?.average || averageRating || 0, 
    count: preloadedRating?.count || totalRatings || 0 
  });
  const [loadingRating, setLoadingRating] = useState(false);

  // Memoize auth token to avoid repeated localStorage calls
  const authToken = useMemo(() => {
    return userInfo?.token || localStorage.getItem('authToken');
  }, [userInfo]);

  // Memoize image processing
  const imageData = useMemo(() => {
    const images = product.images || [];
    const primaryImage = images.find(img => img.is_primary === 1 || img.is_primary === true);
    
    return {
      images,
      primaryImage,
      hasMultipleImages: images.length > 1
    };
  }, [product.images]);

  // Optimized effect that combines both API calls
  useEffect(() => {
    let isMounted = true;
    
    const fetchProductData = async () => {
      if (!product.product_id || !authToken) {
        if (!authToken) {
          setVerifiedOwnership(false);
        }
        return;
      }

      // Skip ownership check if explicitly told to or if we already have the info
      const needsOwnershipCheck = !skipOwnershipCheck && verifiedOwnership === null;
      const needsRatingCheck = !preloadedRating && productRating.average === 0;

      if (!needsOwnershipCheck && !needsRatingCheck) {
        return;
      }

      try {
        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };

        // Create promises for the needed API calls
        const promises = [];
        const promiseTypes = [];

        if (needsOwnershipCheck) {
          promises.push(
            fetch(`http://localhost:8000/api/products/${product.product_id}/check-owner`, { headers })
          );
          promiseTypes.push('ownership');
        }

        if (needsRatingCheck) {
          promises.push(
            fetch(`http://localhost:8000/api/products/${product.product_id}/average-rating`, { headers })
          );
          promiseTypes.push('rating');
        }

        // Execute all promises concurrently
        if (promises.length > 0) {
          const responses = await Promise.all(promises);
          
          // Process responses
          for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            const type = promiseTypes[i];

            if (!isMounted) return;

            if (response.ok) {
              const data = await response.json();
              
              if (type === 'ownership') {
                setVerifiedOwnership(data.isOwner);
              } else if (type === 'rating') {
                setProductRating({
                  average: data.average_rating || 0,
                  count: data.total_ratings || 0
                });
              }
            } else {
              console.error(`Failed to fetch ${type}:`, response.statusText);
              if (type === 'ownership') {
                setVerifiedOwnership(false);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        if (needsOwnershipCheck && isMounted) {
          setVerifiedOwnership(false);
        }
      }
    };

    // Set initial ownership if we have the info already
    if (skipOwnershipCheck || (authToken && isOwner)) {
      setVerifiedOwnership(isOwner);
    }

    fetchProductData();

    return () => {
      isMounted = false;
    };
  }, [product.product_id, authToken, skipOwnershipCheck, isOwner, preloadedRating]);

  // Optimized image display function
  const getDisplayImage = useMemo(() => {
    const { images, primaryImage } = imageData;
    
    if (images.length > 0) {
      if (isHovered && images.length > 1) {
        return images[currentImageIndex]?.image_path;
      }
      return primaryImage?.image_path || images[0]?.image_path;
    }
    
    if (product.image) {
      return product.image.startsWith('http') ? product.image : `${storageUrl}/${product.image}`;
    }
    
    return null;
  }, [imageData, isHovered, currentImageIndex, product.image, storageUrl]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (imageData.hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? imageData.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (imageData.hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === imageData.images.length - 1 ? 0 : prev + 1));
    }
  };

  // Memoized star rendering
  const renderStars = useMemo(() => {
    return (rating, size = 16) => {
      const stars = [];
      
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <FiStar
            key={i}
            size={size}
            className={`${
              i <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } transition-colors`}
          />
        );
      }
      
      return stars;
    };
  }, []);

  // Use verified ownership or prop-passed ownership
  const displayAsOwner = verifiedOwnership !== null ? verifiedOwnership : isOwner;
  const isCheckingOwnership = !skipOwnershipCheck && verifiedOwnership === null && authToken;

  // Show loading only if we're actually checking ownership and it's taking time
  if (isCheckingOwnership) {
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        {/* Show the product with a subtle loading indicator instead of full loading screen */}
        <div className="relative">
          {/* Product Image */}
          <div className={`relative bg-gray-100 ${imageHeight}`}>
            {getDisplayImage ? (
              <img 
                src={getDisplayImage}
                alt={product.product_name}
                className="w-full h-full object-cover opacity-75"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FiShoppingCart size={48} />
              </div>
            )}
            
            {/* Loading overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00796B]"></div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {product.product_name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="font-bold text-[#00796B]">
              ${parseFloat(product.price).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image */}
      <div className={`relative bg-gray-100 ${imageHeight}`}>
        {getDisplayImage ? (
          <>
            <img 
              src={getDisplayImage}
              alt={product.product_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.png';
              }}
            />
            
            {/* Trending Badge */}
            {showTrending && (
              <div className="absolute top-0 right-0 bg-rose-500 text-white px-2 py-1 text-xs font-medium">
                Trending
              </div>
            )}
            
            {/* Average Rating Badge */}
            {productRating.average > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-full flex items-center gap-1">
                <FiStar size={12} className="text-yellow-400 fill-current" />
                <span>{productRating.average.toFixed(1)}</span>
                {productRating.count > 0 && <span>({productRating.count})</span>}
              </div>
            )}
            
            {/* Image carousel navigation */}
            {isHovered && imageData.hasMultipleImages && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1 text-gray-800 transition-all"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={20} />
                </button>
                
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1 text-gray-800 transition-all"
                  aria-label="Next image"
                >
                  <FiChevronRight size={20} />
                </button>
                
                {/* Image counter indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{imageData.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FiShoppingCart size={48} />
          </div>
        )}
        
        {/* Stock indicator for inventory page */}
        {showInventoryPrice && product.stock !== undefined && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            product.stock > 10 
              ? 'bg-green-100 text-green-800' 
              : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {product.product_name}
            {displayAsOwner && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00796B] text-white">
                <FiStar className="mr-1" size={10} /> Your Product
              </span>
            )}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {/* Rating Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            {loadingRating ? (
              <div className="flex items-center gap-2">
                <div className="animate-pulse flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="flex gap-1">
                  {renderStars(productRating.average, 16)}
                </div>
                <span className="text-sm text-gray-600">
                  {productRating.average > 0 ? (
                    <>
                      {productRating.average.toFixed(1)} 
                      {productRating.count > 0 && (
                        <span className="text-gray-500">
                          ({productRating.count} review{productRating.count !== 1 ? 's' : ''})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500">No reviews yet</span>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Show category if it's the inventory page */}
        {showInventoryPrice && product.category && (
          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
        )}
        
        <div className="flex justify-between items-center">
          {/* Price section */}
          <div>
            {showInventoryPrice && product.inventory_price && (
              <div className="font-bold text-[#00796B]">
                Cost: ${parseFloat(product.inventory_price).toFixed(2)}
              </div>
            )}
            
            <div className={showInventoryPrice ? "text-sm text-gray-500" : "font-bold text-[#00796B]"}>
              ${parseFloat(product.price).toFixed(2)}
              {showInventoryPrice && " (Sale Price)"}
            </div>
          </div>
          
          {displayAsOwner ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onEditProduct(product)}
                className="p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors"
                title="Edit product"
              >
                <FiEdit size={18} />
              </button>
              
              {!showInventoryPrice && onPromoteProduct && (
                <button
                  onClick={() => onPromoteProduct(product)}
                  className={`p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors ${
                    processingInventory === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={processingInventory === product.product_id}
                  title="Move to inventory"
                >
                  <FiBox size={18} />
                </button>
              )}
              
              <button
                onClick={() => onDeleteProduct(product)}
                className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ${
                  deletingProductId === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={deletingProductId === product.product_id}
                title="Delete product"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => onAddToCart(product)}
                className={`p-2 rounded-full transition-colors ${
                  isInCart
                    ? 'bg-[#00796B] text-white hover:bg-[#00695C]'
                    : 'text-[#00796B] hover:bg-[#E0F2F1]'
                }`}
                title={isInCart ? "Already in cart" : "Add to cart"}
              >
                <FiShoppingCart size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* View Details button */}
        <div className="mt-3">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded flex items-center justify-center gap-1 transition-colors"
          >
            <FiEye size={16} /> View Details
          </button>
        </div>
        
        {/* Added date for inventory products */}
        {showInventoryPrice && (
          <div className="mt-3 text-sm text-gray-500">
            Added: {new Date(product.created_at || product.added_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;