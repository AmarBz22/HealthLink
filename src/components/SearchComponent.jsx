
// Main SearchComponent (Parent)
import React, { useState } from 'react';
import { FiSearch, FiX, FiFilter, FiCamera } from 'react-icons/fi';
import ImageSearchComponent from './ImageSearch';

const SearchComponent = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  categories = [],
  filteredResultsCount = 0,
  totalResultsCount = 0,
  onClearFilters,
  hasActiveFilters = false,
  showResultsSummary = false,
  placeholder = "Search for products, categories, or brands...",
  title = "Find What You Need",
  subtitle = "Search through thousands of medical products and supplies",
  onImageSearchResults
}) => {
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchResults, setImageSearchResults] = useState([]);
  const [hasImageSearched, setHasImageSearched] = useState(false);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePriceMinChange = (e) => {
    setPriceRange(prev => ({ ...prev, min: e.target.value }));
  };

  const handlePriceMaxChange = (e) => {
    setPriceRange(prev => ({ ...prev, max: e.target.value }));
  };

  const handleImageSearchResults = (results) => {
    setImageSearchResults(results);
    setHasImageSearched(true);
    if (onImageSearchResults) {
      onImageSearchResults(results);
    }
  };

  const handleImageSearchReset = () => {
    setImageSearchResults([]);
    setHasImageSearched(false);
  };

  const handleImageSearchClose = () => {
    setShowImageSearch(false);
    handleImageSearchReset();
  };

  return (
    <div className="py-10 bg-gradient-to-r from-[#F0F9FF] via-white to-[#F0F9FF] border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Main Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative group">
            <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-[#00796B] transition-colors" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-14 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#00796B]/20 focus:border-[#00796B] transition-all text-lg shadow-lg hover:shadow-xl bg-white"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>

          {/* Image Search Toggle */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowImageSearch(!showImageSearch)}
              className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-[#00796B] hover:bg-[#F0F9FF] transition-all shadow-md hover:shadow-lg"
            >
              <FiCamera className="mr-2 text-[#00796B]" />
              <span className="text-gray-700 font-medium">
                {showImageSearch ? 'Hide Image Search' : 'Search by Image'}
              </span>
            </button>
          </div>
        </div>

        {/* Image Search Component (Child) */}
        {showImageSearch && (
          <div className="max-w-4xl mx-auto mb-8">
            <ImageSearchComponent
              onSearchResults={handleImageSearchResults}
              onClose={handleImageSearchClose}
              onReset={handleImageSearchReset}
              searchResults={imageSearchResults}
              hasSearched={hasImageSearched}
              isVisible={showImageSearch}
            />
          </div>
        )}

        {/* Enhanced Filters Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Price Range Filters */}
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
            <input
              type="number"
              placeholder="Min $"
              value={priceRange.min}
              onChange={handlePriceMinChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-transparent text-sm"
            />
            <span className="text-gray-400 font-medium">to</span>
            <input
              type="number"
              placeholder="Max $"
              value={priceRange.max}
              onChange={handlePriceMaxChange}
              className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796B] focus:border-transparent text-sm"
            />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00796B] focus:border-[#00796B] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <option value="product_name">Sort by Name</option>
              <option value="price">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-6 py-3 bg-gradient-to-r from-[#00796B] to-[#26A69A] text-white font-medium rounded-xl hover:from-[#00695C] hover:to-[#00796B] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search Results Summary */}
        {showResultsSummary && (searchQuery || hasActiveFilters || hasImageSearched) && (
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md">
              <FiSearch className="text-[#00796B] mr-2" />
              <p className="text-gray-700 font-medium">
                {filteredResultsCount === 0 ? 
                  'No products found' : 
                  `Found ${filteredResultsCount} of ${totalResultsCount} products`
                }
                {searchQuery && (
                  <span className="text-[#00796B]"> for "{searchQuery}"</span>
                )}
                {hasImageSearched && !searchQuery && (
                  <span className="text-[#00796B]"> from image search</span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;