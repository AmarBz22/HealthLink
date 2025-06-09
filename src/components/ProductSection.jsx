import { useState } from 'react';
import { FiPlus, FiShoppingCart, FiCamera, FiX } from 'react-icons/fi';
import ProductCard from './ProductCard';
import ImageSearchComponent from './ImageSearch';

const ProductsSection = ({ 
  products, 
  isOwner, 
  storeId,
  userRole,
  productType = "new", // Add productType prop with default value
  deletingProductId,
  processingInventory,
  storageUrl, 
  onAddProduct, 
  onDeleteProduct, 
  onEditProduct,
  onPromoteProduct,
  onAddToCart
}) => {
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResults = (results) => {
    // Filter search results to match the current product type
    const filteredResults = results.filter(item => {
      // Handle the nested structure from your API response
      const product = item.product || item;
      return product.type === productType;
    });
    
    setSearchResults(filteredResults);
    setHasSearched(true);
  };

  const handleResetSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleCloseSearch = () => {
    setShowImageSearch(false);
    setSearchResults([]);
    setHasSearched(false);
  };

  const resetImageSearch = () => {
    setShowImageSearch(false);
    setSearchResults([]);
    setHasSearched(false);
  };

  // Process search results to extract product data if needed
  const processedSearchResults = searchResults.map(item => {
    // If the search result has nested structure, extract the product
    if (item.product) {
      return {
        ...item.product,
        // Add image information if available
        primary_image: item.image?.image_path,
        distance: item.distance // Keep search relevance score if needed
      };
    }
    return item;
  });

  const displayProducts = processedSearchResults.length > 0 ? processedSearchResults : products;
  const isShowingSearchResults = hasSearched && processedSearchResults.length > 0;
  const isShowingNoResults = hasSearched && processedSearchResults.length === 0;

  // Determine button text based on user role
  const getAddProductButtonText = () => {
    if (userRole === 'Dentist' || userRole === 'Doctor') {
      return 'Add Used Equipment';
    }
    return 'Add Product';
  };

  if (products.length === 0 && !isShowingSearchResults && !isShowingNoResults) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#E0F2F1] rounded-full p-4">
            <FiShoppingCart size={32} className="text-[#00796B]" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
        <p className="text-gray-600 mb-6">There are no products to display at this time.</p>
        
        {isOwner && (
          <button
            onClick={onAddProduct}
            className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
          >
            <FiPlus className="mr-2" /> {getAddProductButtonText()}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-sm text-gray-500">
          {isShowingSearchResults ? (
            <span>
              {processedSearchResults.length} search {processedSearchResults.length === 1 ? 'result' : 'results'} found
            </span>
          ) : isShowingNoResults ? (
            <span>No similar products found</span>
          ) : (
            <span>
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Image Search Button */}
          {!showImageSearch && (
            <button
              onClick={() => setShowImageSearch(true)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiCamera className="mr-2" size={16} /> Search by Image
            </button>
          )}

          {/* Reset Search Results */}
          {(isShowingSearchResults || isShowingNoResults) && (
            <button
              onClick={resetImageSearch}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiX className="mr-2" size={16} /> Show All Products
            </button>
          )}
          
          {/* Add Product Button (Owner Only) */}
          {isOwner && (
            <button
              onClick={onAddProduct}
              className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors shadow-sm"
            >
              <FiPlus className="mr-2" /> {getAddProductButtonText()}
            </button>
          )}
        </div>
      </div>

      {/* Image Search Component */}
      <ImageSearchComponent
        isVisible={showImageSearch}
        searchResults={processedSearchResults}
        hasSearched={hasSearched}
        onSearchResults={handleSearchResults}
        onReset={handleResetSearch}
        onClose={handleCloseSearch}
      />

      {/* Products Grid */}
      {!isShowingNoResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isOwner={isOwner}
              storageUrl={storageUrl}
              deletingProductId={deletingProductId}
              processingInventory={processingInventory}
              onDeleteProduct={onDeleteProduct}
              onEditProduct={onEditProduct}
              onPromoteProduct={onPromoteProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsSection;