import { FiChevronRight } from 'react-icons/fi';

const SectionHeader = ({ title, showViewAll = true, onViewAllClick, viewAllText = "View All" }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900">
        {title}
      </h2>
      {showViewAll && onViewAllClick && (
        <button
          onClick={onViewAllClick}
          className="flex items-center text-[#00796B] hover:text-[#00695C] font-semibold"
        >
          {viewAllText} <FiChevronRight className="ml-1 h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;