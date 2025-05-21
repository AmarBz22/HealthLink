import { useState, useEffect } from 'react';
import { FiPackage, FiPlusCircle, FiArrowRight, FiSearch, FiFilter, FiHeart, FiUser, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Static equipment data
const staticEquipments = [
  {
    id: 1,
    name: "GE Vivid E9 Ultrasound Machine",
    description: "Cardiac ultrasound system with 4D imaging capability. Includes 3 probes and printer. Serviced annually, last calibration 3 months ago.",
    category: "Imaging",
    condition: "Good",
    price: 35000.00,
    image_url: "/equipment/ultrasound.jpg",
    seller_name: "Johnson",
    is_verified: true,
    listed_date: "2025-04-15T10:30:00"
  },
  {
    id: 2,
    name: "Stryker Advanced Surgical Table",
    description: "Electric surgical table with lateral tilt, trendelenburg positioning. Max patient weight 500 lbs. Minor wear on remote control.",
    category: "Surgical",
    condition: "Like New",
    price: 24500.00,
    image_url: "/equipment/surgical-table.jpg",
    seller_name: "Martinez",
    is_verified: true,
    listed_date: "2025-04-28T14:15:00"
  },
  {
    id: 3,
    name: "Philips IntelliVue MP70 Patient Monitor",
    description: "ICU-grade vital signs monitor with touchscreen interface. Includes ECG, SpO2, NIBP, and temperature modules. Recently recertified.",
    category: "Monitoring",
    condition: "Good",
    price: 8750.00,
    image_url: "/equipment/patient-monitor.jpg",
    seller_name: "Washington",
    is_verified: false,
    listed_date: "2025-05-02T09:45:00"
  },
  {
    id: 4,
    name: "Zeiss OPMI Surgical Microscope",
    description: "Ophthalmic surgical microscope with integrated video camera. Includes floor stand and controller. Minor cosmetic wear.",
    category: "Surgical",
    condition: "Fair",
    price: 12800.00,
    image_url: "/equipment/microscope.jpg",
    seller_name: "Patel",
    is_verified: true,
    listed_date: "2025-04-10T16:20:00"
  },
  {
    id: 5,
    name: "Midmark Dental Chair",
    description: "Fully electric dental examination chair with programmable positions. Upholstery in excellent condition. Includes delivery system and light.",
    category: "Dental",
    condition: "Like New",
    price: 9200.00,
    image_url: "/equipment/dental-chair.jpg",
    seller_name: "Williams",
    is_verified: true,
    listed_date: "2025-05-05T11:10:00"
  },
  {
    id: 6,
    name: "Abbott i-STAT Blood Analyzer",
    description: "Portable clinical blood analyzer with test cartridges included. Perfect for point-of-care testing. Recently serviced.",
    category: "Laboratory",
    condition: "Good",
    price: 3500.00,
    image_url: "/equipment/blood-analyzer.jpg",
    seller_name: "Chen",
    is_verified: false,
    listed_date: "2025-04-22T13:50:00"
  },
  {
    id: 7,
    name: "Welch Allyn Diagnostic Set",
    description: "Complete diagnostic set with otoscope and ophthalmoscope. Lithium-ion handle with charging base included.",
    category: "Diagnostic",
    condition: "New",
    price: 950.00,
    image_url: "/equipment/diagnostic-set.jpg",
    seller_name: "Garcia",
    is_verified: true,
    listed_date: "2025-05-07T10:00:00"
  },
  {
    id: 8,
    name: "Siemens Portable X-Ray Machine",
    description: "Mobile digital X-ray unit. Battery operated with wireless detector. Selling due to practice downsizing.",
    category: "Imaging",
    condition: "For Parts",
    price: 18500.00,
    image_url: "/equipment/xray-machine.jpg",
    seller_name: "Thompson",
    is_verified: true,
    listed_date: "2025-04-18T15:30:00"
  },
  {
    id: 9,
    name: "Olympus Endoscopy System",
    description: "Complete endoscopy tower with gastroscope and colonoscope. Includes processor, light source and monitor.",
    category: "Diagnostic",
    condition: "Good",
    price: 27500.00,
    image_url: "/equipment/endoscopy.jpg",
    seller_name: "Kim",
    is_verified: true,
    listed_date: "2025-05-01T09:15:00"
  }
];

const UsedMedicalEquipmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  
  // Categories for medical equipment
  const categories = ['Diagnostic', 'Monitoring', 'Surgical', 'Laboratory', 'Imaging', 'Dental', 'Other'];
  
  // Condition options
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

  // Simulate loading the static data
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setEquipments(staticEquipments);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter equipment based on search term, category and condition
  const filteredEquipments = equipments.filter(equipment => {
    const matchesSearch = searchTerm === '' || 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || 
      equipment.category === filterCategory;
    
    const matchesCondition = filterCondition === '' || 
      equipment.condition === filterCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  // Function to handle saving an item to favorites (static version)
  const handleSaveToFavorites = (equipmentId) => {
    toast.success('Added to your favorites');
    console.log(`Equipment ID ${equipmentId} added to favorites`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with matching inventory color scheme */}
      <div className="bg-[#00796B] rounded-xl p-6 mb-8 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <FiPackage className="mr-3" /> Used Medical Equipment 
          </h1>
          <p className="text-teal-100 mt-1">Buy and sell pre-owned medical equipment exclusively for healthcare professionals</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate('/used-equipment/add')}
            className="bg-white text-[#00796B] px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-100 transition-colors"
          >
            <FiPlusCircle className="mr-2" /> Add Equipment
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#00695C] text-white px-3 py-2 rounded-lg font-medium flex items-center hover:bg-[#004D40] transition-colors"
          >
            <FiArrowRight className="ml-1 transform rotate-180" /> Back
          </button>
        </div>
      </div>

      {/* Search and Filter Section with inventory color scheme */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              placeholder="Search equipment name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#00796B] focus:border-transparent"
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="">All Conditions</option>
              {conditions.map((condition, index) => (
                <option key={index} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipments.map((equipment) => (
              <div key={equipment.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white relative">
                {/* Condition Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                  equipment.condition === 'New' ? 'bg-green-500' :
                  equipment.condition === 'Like New' ? 'bg-[#00796B]' :
                  equipment.condition === 'Good' ? 'bg-yellow-500' :
                  equipment.condition === 'Fair' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {equipment.condition}
                </div>

                {/* Equipment Image */}
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  <img 
                    src={equipment.image_url || '/placeholder-equipment.jpg'} 
                    alt={equipment.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-equipment.jpg';
                    }}
                  />
                </div>
                
                {/* Equipment Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {equipment.name}
                    </h3>
                    <button 
                      onClick={() => handleSaveToFavorites(equipment.id)}
                      className="text-[#00796B] hover:text-[#00695C]" 
                      aria-label="Save to favorites"
                    >
                      <FiHeart />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1">Category: {equipment.category}</p>
                  
                  <div className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {equipment.description}
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <span className="text-xl font-bold text-[#00796B]">
                      ${parseFloat(equipment.price).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Seller and Certification Info */}
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <FiUser className="mr-1" />
                    <span>Dr. {equipment.seller_name}</span>
                    {equipment.is_verified && (
                      <span className="flex items-center ml-2 text-green-600">
                        <FiShield className="mr-1" /> Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Listed: {new Date(equipment.listed_date).toLocaleDateString()}
                    </span>
                    
                    <button 
                      onClick={() => navigate(`/used-equipment/${equipment.id}`)}
                      className="flex items-center px-3 py-1 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors text-sm"
                    >
                      View Details <FiArrowRight className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEquipments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FiPackage className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No medical equipment listings found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filterCategory || filterCondition
                  ? "Try adjusting your search or filter criteria"
                  : "Be the first to list your medical equipment for sale"}
              </p>
              <button
                onClick={() => navigate('/used-equipment/add')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#00796B] text-white rounded-lg hover:bg-[#00695C] transition-colors"
              >
                <FiPlusCircle className="mr-2" /> Add Equipment
              </button>
            </div>
          )}
        </>
      )}


    </div>
  );
};

export default UsedMedicalEquipmentPage;