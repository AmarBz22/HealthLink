import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useNavigate } from 'react-router-dom';

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
  // Optimization props
  userInfo = null,
  skipOwnershipCheck = false,
  preloadedRating = null,
  // New optimization props
  authToken = null,
  batchedData = null,
  disableRatingFetch = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [verifiedOwnership, setVerifiedOwnership] = useState(
    skipOwnershipCheck ? isOwner : null
  );
  const [productRating, setProductRating] = useState({ 
    average: preloadedRating?.average || averageRating || 0, 
    count: preloadedRating?.count || totalRatings || 0 
  });
  const [loadingRating, setLoadingRating] = useState(false);
  const [loadingOwnership, setLoadingOwnership] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();

  // Determine if inventory price should be shown based on product type
  const shouldShowInventoryPrice = useMemo(() => {
    return showInventoryPrice || product.type === 'inventory';
  }, [showInventoryPrice, product.type]);

  // Get auth token with fallback
  const token = useMemo(() => {
    return authToken || userInfo?.token || localStorage.getItem('authToken');
  }, [authToken, userInfo]);

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

  // Optimized display image calculation
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

  // Debounced API call function
  const debouncedFetch = useCallback((fn, delay = 100) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }, []);

  // Single optimized data fetch effect
  useEffect(() => {
    if (!product.product_id || !token || dataFetched) {
      if (!token) {
        setVerifiedOwnership(false);
        setLoadingOwnership(false);
      }
      return;
    }

    if (batchedData && batchedData[product.product_id]) {
      const data = batchedData[product.product_id];
      if (data.ownership !== undefined) {
        setVerifiedOwnership(data.ownership);
        setLoadingOwnership(false);
      }
      if (data.rating) {
        setProductRating({
          average: data.rating.average || 0,
          count: data.rating.count || 0
        });
      }
      setDataFetched(true);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchProductData = async () => {
      const needsOwnershipCheck = !skipOwnershipCheck && verifiedOwnership === null;
      const needsRatingCheck = !disableRatingFetch && !preloadedRating && productRating.average === 0;

      if (!needsOwnershipCheck && !needsRatingCheck) {
        setDataFetched(true);
        return;
      }

      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const requests = [];
        
        if (needsOwnershipCheck) {
          setLoadingOwnership(true);
          requests.push({
            type: 'ownership',
            promise: fetch(
              `http://192.168.43.101:8000/api/products/${product.product_id}/check-owner`, 
              { headers, signal: controller.signal }
            )
          });
        }

        if (needsRatingCheck) {
          setLoadingRating(true);
          requests.push({
            type: 'rating',
            promise: fetch(
              `http://192.168.43.101:8000/api/products/${product.product_id}/average-rating`, 
              { headers, signal: controller.signal }
            )
          });
        }

        if (requests.length === 0) {
          setDataFetched(true);
          return;
        }

        const results = await Promise.allSettled(requests.map(r => r.promise));
        
        for (let i = 0; i < results.length; i++) {
          if (!isMounted) break;
          
          const result = results[i];
          const requestType = requests[i].type;
          
          if (result.status === 'fulfilled' && result.value.ok) {
            try {
              const data = await result.value.json();
              
              if (requestType === 'ownership') {
                setVerifiedOwnership(data.isOwner);
              } else if (requestType === 'rating') {
                setProductRating({
                  average: data.average_rating || 0,
                  count: data.total_ratings || 0
                });
              }
            } catch (parseError) {
              console.warn(`Failed to parse ${requestType} response:`, parseError);
              if (requestType === 'ownership') {
                setVerifiedOwnership(false);
              }
            }
          } else {
            if (requestType === 'ownership') {
              setVerifiedOwnership(false);
            }
            if (result.status === 'rejected' && result.reason.name !== 'AbortError') {
              console.warn(`${requestType} request failed:`, result.reason);
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error fetching product data:', error);
          if (needsOwnershipCheck) {
            setVerifiedOwnership(false);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingRating(false);
          setLoadingOwnership(false);
          setDataFetched(true);
        }
      }
    };

    const debouncedFetchData = debouncedFetch(fetchProductData, 50);
    debouncedFetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [
    product.product_id, 
    token, 
    skipOwnershipCheck, 
    disableRatingFetch,
    preloadedRating,
    batchedData,
    dataFetched
  ]);

  // Memoized event handlers
  const handlePrevImage = useCallback((e) => {
    e.stopPropagation();
    if (imageData.hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? imageData.images.length - 1 : prev - 1));
    }
  }, [imageData.hasMultipleImages, imageData.images.length]);

  const handleNextImage = useCallback((e) => {
    e.stopPropagation();
    if (imageData.hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev === imageData.images.length - 1 ? 0 : prev + 1));
    }
  }, [imageData.hasMultipleImages, imageData.images.length]);

  // Memoized star rendering
  const renderStars = useMemo(() => {
    return (rating, size = 16) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <FiStar
            key={i}
            size={size}
            className={`${
              i <= fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars + 1 && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            } transition-colors`}
          />
        );
      }
      
      return stars;
    };
  }, []);

  // Handle edit navigation based on product type
  const handleEditClick = useCallback(() => {
    if (product.type === 'used_equipment') {
      navigate(`/used-equipment/edit/${product.product_id}`);
    } else {
      navigate(`/${product.store_id}/products/${product.product_id}/edit`);
    }
    onEditProduct(product);
  }, [navigate, product, onEditProduct]);

  // Determine ownership status and loading states
  const displayAsOwner = verifiedOwnership !== null ? verifiedOwnership : isOwner;
  const isCheckingOwnership = !skipOwnershipCheck && verifiedOwnership === null && token && !dataFetched;
  const showButtonsLoading = loadingOwnership || isCheckingOwnership;

  // Loading spinner component
  const LoadingSpinner = ({ size = 16 }) => (
    <div 
      className="animate-spin rounded-full border-t-2 border-b-2 border-[#00796B]" 
      style={{ width: size, height: size }}
    />
  );

  // Render action buttons with loading states
  const renderActionButtons = () => {
    if (showButtonsLoading) {
      return (
        <div className="flex justify-center items-center h-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00796B] mx-auto"></div>
          </div>
        </div>
      );
    }

    if (displayAsOwner) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={handleEditClick}
            className="p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors"
            title="Edit product"
          >
            <FiEdit size={18} />
          </button>
          
          {product.type !== 'used_equipment' && !shouldShowInventoryPrice && onPromoteProduct && (
            <button
              onClick={() => onPromoteProduct(product)}
              className={`p-2 text-[#00796B] hover:bg-[#E0F2F1] rounded-full transition-colors ${
                processingInventory === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={processingInventory === product.product_id}
              title="Move to inventory"
            >
              {processingInventory === product.product_id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00796B]"></div>
              ) : (
                <FiBox size={18} />
              )}
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
            {deletingProductId === product.product_id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00796B]"></div>
            ) : (
              <FiTrash2 size={18} />
            )}
          </button>
        </div>
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <div className={`relative bg-gray-100 ${imageHeight}`}>
        {getDisplayImage ? (
          <>
            <img 
              src={getDisplayImage}
              alt={product.product_name}
              className={`w-full h-full object-cover transition-opacity ${showButtonsLoading ? 'opacity-75' : ''}`}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.png';
              }}
            />
            {showButtonsLoading && (
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00796B]"></div>
              </div>
            )}
            {showTrending && (
              <div className="absolute top-0 left-0 bg-rose-500 text-white px-2 py-1 text-xs font-medium rounded-br">
                Trending
              </div>
            )}
            {productRating.average > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-full flex items-center gap-1">
                <FiStar size={12} className="text-yellow-400 fill-current" />
                <span>{productRating.average.toFixed(1)}</span>
                {productRating.count > 0 && <span>({productRating.count})</span>}
              </div>
            )}
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
        {shouldShowInventoryPrice && product.stock !== undefined && (
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
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {product.product_name}
            {displayAsOwner && !showButtonsLoading && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00796B] text-white">
                <FiStar className="mr-1" size={10} /> Your Product
              </span>
            )}
            {showButtonsLoading && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                <div className="animate-spin rounded-full h-2.5 w-2.5 border-t-1 border-b-1 border-[#00796B] mr-1"></div>
                <span>Checking...</span>
              </span>
            )}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {!disableRatingFetch && (
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
        )}
        
        {/* Display category for all product types */}
        {product.category && (
          <p className="text-sm text-gray-500 mb-2">Category: {product.category}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            {shouldShowInventoryPrice && product.inventory_price && (
              <div className="font-bold text-[#00796B]">
                Cost: DZD {parseFloat(product.inventory_price).toFixed(2)}
              </div>
            )}
            <div className={shouldShowInventoryPrice ? "text-sm text-gray-500" : "font-bold text-[#00796B]"}>
              DZD {parseFloat(product.price).toFixed(2)}
              {shouldShowInventoryPrice && " (Sale Price)"}
            </div>
          </div>
          
          {renderActionButtons()}
        </div>
        
        <div className="mt-3">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded flex items-center justify-center gap-1 transition-colors"
          >
            <FiEye size={16} /> View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;