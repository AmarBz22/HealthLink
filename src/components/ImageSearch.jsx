import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUpload, FiSearch, FiRefreshCw } from 'react-icons/fi';

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
    if (!searchImage) {
      setSearchError('Please select an image first');
      return;
    }
  
    setIsSearching(true);
    setSearchError('');
  
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      const formData = new FormData();
      formData.append('image', searchImage);
  
      const response = await fetch('http://192.168.43.101:8000/api/search-by-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
        },
      });
      
      const responseText = await response.text();
      
      if (responseText.trim() === '') {
        if (response.status === 200) {
          throw new Error('Server returned empty response. Check your Laravel controller method.');
        } else {
          throw new Error(`Server returned ${response.status} ${response.statusText} with empty response.`);
        }
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          throw new Error('Server error: Check Laravel logs for detailed error information.');
        }
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
  
      if (!response.ok) {
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

      // Transform and deduplicate products
      const rawResults = (data.data || []).map(item => ({
        product_id: item.product.product_id,
        product_name: item.product.product_name,
        price: item.product.price,
        category: item.product.category,
        type: item.product.type,
        image_path: item.image.image_path,
        is_primary: item.image.is_primary,
        distance: item.distance,
        image_url: item.image.image_path,
        primary_image: item.image.image_path,
        images: [{ 
          id: item.image.id,
          image_path: item.image.image_path, 
          is_primary: item.image.is_primary 
        }]
      }));

      // Deduplicate by product_id, keeping the result with the lowest distance
      const productMap = new Map();
      
      rawResults.forEach(product => {
        const existingProduct = productMap.get(product.product_id);
        
        if (!existingProduct || product.distance < existingProduct.distance) {
          productMap.set(product.product_id, product);
        }
      });

      const deduplicatedProducts = Array.from(productMap.values());
deduplicatedProducts.sort((a, b) => a.distance - b.distance);
console.log('Image search results before passing to parent:', deduplicatedProducts.map(p => ({
  product_id: p.product_id,
  product_name: p.product_name,
  distance: p.distance
})));
onSearchResults(deduplicatedProducts);
      
      onSearchResults(deduplicatedProducts);

    } catch (error) {
      setSearchError(error.message || 'Failed to search. Please try again.');
      onSearchResults([]);
    } finally {
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

  const tryAnotherImage = () => {
    setSearchImage(null);
    setSearchImagePreview(null);
    setSearchError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isShowingNoResults = hasSearched && searchResults.length === 0;

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      {/* Compact Image Search Interface */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <FiCamera className="mr-2 text-[#00796B]" size={16} /> 
            Search by Image
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Compact Upload/Preview */}
        {!searchImagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#00796B] hover:bg-gray-50 transition-colors"
          >
            <FiUpload size={20} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload product image</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, JPG (max 10MB)</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={searchImagePreview}
                alt="Search preview"
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <button
                onClick={tryAnotherImage}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
              >
                <FiX size={10} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 truncate mb-2">{searchImage?.name}</p>
              <button
                onClick={handleImageSearch}
                disabled={isSearching}
                className="inline-flex items-center px-3 py-1.5 bg-[#00796B] text-white text-sm rounded-lg hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1.5"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-1.5" size={12} /> Find Similar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Compact Error Message */}
        {searchError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start">
            {searchError}
          </div>
        )}
      </div>

      {/* Compact No Results State */}
      {isShowingNoResults && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <FiSearch size={24} className="text-orange-500 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-900 mb-2">No similar products found</h4>
          <p className="text-xs text-gray-600 mb-3">
            Try a different image or browse all products
          </p>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={tryAnotherImage}
              className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FiRefreshCw className="mr-1" size={12} /> Try Another
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              Browse All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearchComponent;