import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload, FiSearch, FiRefreshCw, FiShoppingCart } from 'react-icons/fi';

const ImageSearchComponent = ({ 
  onSearchResults, 
  onClose, 
  onReset,
  searchResults = [],
  hasSearched = false,
  isVisible = false 
}) => {
  const [searchImage, setSearchImage] = useState(null);
  const [searchImagePreview, setSearchImagePreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setSearchError('Please select a valid image file (JPEG, PNG, JPG)');
        return;
      }

      if (file.size > maxSize) {
        setSearchError('Image size must be less than 10MB');
        return;
      }

      setSearchImage(file);
      setSearchError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        setSearchImagePreview(e.target.result);
      };
      reader.onerror = () => {
        setSearchError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearch = async () => {
    console.log('🔍 handleImageSearch called');
    
    if (!searchImage) {
      console.log('❌ No search image selected');
      setSearchError('Please select an image first');
      return;
    }
    
    console.log('📷 Search image details:', {
      name: searchImage.name,
      size: searchImage.size,
      type: searchImage.type
    });
  
    setIsSearching(true);
    setSearchError('');
    console.log('🚀 Starting image search...');
  
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log('🔒 CSRF Token:', csrfToken ? 'Found' : 'Not found');
      
      const formData = new FormData();
      formData.append('image', searchImage);
      console.log('📦 FormData prepared with image');
  
      console.log('🌐 Making API request to: http://localhost:8000/api/search-by-image');
      const response = await fetch('http://localhost:8000/api/search-by-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
        },
      });
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
  
      const responseText = await response.text();
      console.log('📄 Raw response text length:', responseText.length);
      console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      if (responseText.trim() === '') {
        console.log('❌ Empty response received');
        if (response.status === 200) {
          throw new Error('Server returned empty response. Check your Laravel controller method.');
        } else {
          throw new Error(`Server returned ${response.status} ${response.statusText} with empty response.`);
        }
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON parsed successfully:', data);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
        console.log('📄 Response text that failed to parse:', responseText);
        if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          throw new Error('Server error: Check Laravel logs for detailed error information.');
        }
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
  
      if (!response.ok) {
        console.log('❌ Response not ok, status:', response.status);
        switch (response.status) {
          case 404:
            throw new Error('API endpoint not found. Ensure /api/search-by-image route exists in routes/api.php');
          case 422:
            throw new Error(`Validation error: ${data.message || data.error || 'Invalid request data'}`);
          case 419:
            throw new Error('CSRF token mismatch. Please refresh the page and try again.');
          case 500:
            throw new Error(`Server error: ${data.message || data.error || 'Internal server error. Check Laravel logs.'}`);
          default:
            throw new Error(data.error || data.message || `HTTP ${response.status}: Request failed`);
        }
      }

      console.log('🔍 Processing search results...');
      console.log('📊 Raw data structure:', data);
      console.log('📊 Data.data array:', data.data);
      console.log('📊 Data.data length:', data.data ? data.data.length : 'undefined');

      // Transform and deduplicate products
      const rawResults = (data.data || []).map(item => {
        console.log('🔄 Processing item:', item);
        return {
          product_id: item.product.product_id,
          product_name: item.product.product_name,
          price: item.product.price,
          category: item.product.category,
          type: item.product.type,
          image_path: item.image.image_path,
          is_primary: item.image.is_primary,
          distance: item.distance,
          // Add multiple field variations that ProductCard might expect
          image_url: item.image.image_path,
          primary_image: item.image.image_path,
          images: [{ 
            id: item.image.id,
            image_path: item.image.image_path, 
            is_primary: item.image.is_primary 
          }]
        };
      });

      console.log('🔄 Raw results after transformation:', rawResults);
      console.log('🔄 Raw results count:', rawResults.length);

      // Deduplicate by product_id, keeping the result with the lowest distance (best match)
      const productMap = new Map();
      
      rawResults.forEach(product => {
        const existingProduct = productMap.get(product.product_id);
        
        if (!existingProduct || product.distance < existingProduct.distance) {
          productMap.set(product.product_id, product);
        }
      });

      // Convert Map back to array
      const deduplicatedProducts = Array.from(productMap.values());
      console.log('🔄 Deduplicated products:', deduplicatedProducts);
      console.log('🔄 Deduplicated count:', deduplicatedProducts.length);
      
      // Sort by distance (best matches first)
      deduplicatedProducts.sort((a, b) => a.distance - b.distance);
      console.log('🔄 Final sorted products:', deduplicatedProducts);

      console.log('✅ Setting search results:', deduplicatedProducts.length, 'products');
      
      // Call the parent component's callback with results
      onSearchResults(deduplicatedProducts);
      console.log('✅ Search completed successfully');

    } catch (error) {
      console.log('❌ Search failed with error:', error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error stack:', error.stack);
      setSearchError(error.message || 'Failed to search. Please try again.');
      
      // Call parent callback with empty results and error
      onSearchResults([]);
    } finally {
      console.log('🏁 Search process finished, setting isSearching to false');
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSearchImage(null);
    setSearchImagePreview(null);
    setSearchError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onReset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const tryAnotherImage = () => {
    setSearchImage(null);
    setSearchImagePreview(null);
    setSearchError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Keep the search interface open
  };

  const isShowingNoResults = hasSearched && searchResults.length === 0;

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Image Search Interface */}
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FiCamera className="mr-2" /> Search Products by Image
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload Area */}
          {!searchImagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#00796B] hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center">
                <FiUpload size={32} className="text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-400">Supports JPEG, PNG, JPG (max 10MB)</p>
              </div>
            </div>
          ) : (
            /* Image Preview */
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={searchImagePreview}
                  alt="Search preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => {
                    setSearchImage(null);
                    setSearchImagePreview(null);
                    setSearchError('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <FiX size={12} />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Image selected: {searchImage?.name}</p>
                <button
                  onClick={handleImageSearch}
                  disabled={isSearching}
                  className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="mr-2" /> Search Similar Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Error Message */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {searchError}
            </div>
          )}
        </div>
      </div>

      {/* No Similar Products Found State */}
      {isShowingNoResults && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 rounded-full p-4">
              <FiSearch size={32} className="text-orange-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No similar products found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any products that match your image. Try using a different image or browse all available products.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={tryAnotherImage}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FiRefreshCw className="mr-2" size={16} /> Try Another Image
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
            >
              <FiShoppingCart className="mr-2" size={16} /> Browse All Products
            </button>
          </div>
          
          {/* Search Tips */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-medium text-gray-900 mb-2">Search Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use clear, well-lit images with good contrast</li>
              <li>• Ensure the product is the main focus of the image</li>
              <li>• Try different angles or close-up shots</li>
              <li>• Avoid images with too much background clutter</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearchComponent;