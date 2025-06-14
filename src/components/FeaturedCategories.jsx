import { FiChevronRight } from 'react-icons/fi';

const FeaturedCategoriesSection = ({ categories, onViewAllClick, onCategoryClick }) => {
  return (
    <div className="py-12 bg-white/60 backdrop-blur-sm border border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Featured Categories
          </h2>
          <button
            onClick={onViewAllClick}
            className="flex items-center text-[#00796B] hover:text-[#00695C] font-semibold"
          >
            View All <FiChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="bg-white rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-200/50"
              aria-label={`View ${category.name} category`}
            >
              <div className="h-24 w-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#E0F2F1] shadow-sm">
                {category.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategoriesSection;