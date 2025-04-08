import { useState } from 'react';
import { 
  FiPackage, FiTruck, FiDollarSign, FiTrendingUp, FiUsers,
  FiAlertCircle, FiClock, FiAlertTriangle, FiPlus, FiFileText 
} from 'react-icons/fi';

const DashboardPage = () => {
  // Static role selection (will replace with useAuth later)
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin', 'healthcare', or 'supplier'
  
  // Static data for each role
  const metricsData = {
    admin: {
      totalProducts: 142,
      lowStock: 8,
      pendingOrders: 5,
      newSuppliers: 3
    },
    healthcare: {
      activeOrders: 4,
      expiringSoon: 7,
      monthlySpend: '$8,420'
    },
    supplier: {
      monthlySales: '$24,580',
      activeListings: 42,
      pendingShipments: 7
    }
  };

  const recentActivities = [
    { type: 'order', message: 'New order #HL-2042 received', time: '10 mins ago' },
    { type: 'alert', message: 'Low stock: Surgical Gloves', time: '25 mins ago' },
    { type: 'system', message: 'System update completed', time: '2 hours ago' }
  ];

  const alertsData = [
    { severity: 'high', message: '3 orders awaiting approval' },
    { severity: 'medium', message: 'Inventory audit due tomorrow' }
  ];

  const quickActions = {
    admin: [
      { label: 'Add Product', icon: <FiPlus />, path: '/store/items/add' },
      { label: 'View Reports', icon: <FiFileText />, path: '/reports' }
    ],
    healthcare: [
      { label: 'New Order', icon: <FiPlus />, path: '/orders/new' },
      { label: 'Inventory', icon: <FiPackage />, path: '/inventory' }
    ],
    supplier: [
      { label: 'Add Listing', icon: <FiPlus />, path: '/listings/new' },
      { label: 'View Orders', icon: <FiTruck />, path: '/supplier/orders' }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Role Selector (Temporary - remove when auth is implemented) */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
        <label className="mr-3">View as:</label>
        <select 
          value={currentRole} 
          onChange={(e) => setCurrentRole(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="admin">Administrator</option>
          <option value="healthcare">Healthcare Professional</option>
          <option value="supplier">Supplier</option>
        </select>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {currentRole === 'admin' ? 'Admin Dashboard' : 
           currentRole === 'healthcare' ? 'Procurement Dashboard' : 'Supplier Portal'}
        </h1>
        <p className="text-blue-500">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Role-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentRole === 'admin' && (
          <>
            <MetricCard 
              icon={<FiPackage className="text-blue-500" />}
              title="Total Products"
              value={metricsData.admin.totalProducts}
              trend="12% increase"
            />
            <MetricCard 
              icon={<FiAlertCircle className="text-red-500" />}
              title="Low Stock"
              value={metricsData.admin.lowStock}
              trend="3 critical"
            />
            <MetricCard 
              icon={<FiTruck className="text-green-500" />}
              title="Pending Orders"
              value={metricsData.admin.pendingOrders}
              trend="2 need approval"
            />
            <MetricCard 
              icon={<FiUsers className="text-purple-500" />}
              title="New Suppliers"
              value={metricsData.admin.newSuppliers}
              trend="1 needs verification"
            />
          </>
        )}

        {currentRole === 'healthcare' && (
          <>
            <MetricCard 
              icon={<FiPackage className="text-blue-500" />}
              title="Active Orders"
              value={metricsData.healthcare.activeOrders}
              trend="2 arriving today"
            />
            <MetricCard 
              icon={<FiAlertCircle className="text-yellow-500" />}
              title="Expiring Soon"
              value={metricsData.healthcare.expiringSoon}
              trend="Check inventory"
            />
            <MetricCard 
              icon={<FiDollarSign className="text-green-500" />}
              title="Monthly Spend"
              value={metricsData.healthcare.monthlySpend}
              trend="12% under budget"
            />
          </>
        )}

        {currentRole === 'supplier' && (
          <>
            <MetricCard 
              icon={<FiTrendingUp className="text-blue-500" />}
              title="Monthly Sales"
              value={metricsData.supplier.monthlySales}
              trend="8% increase"
            />
            <MetricCard 
              icon={<FiPackage className="text-green-500" />}
              title="Active Listings"
              value={metricsData.supplier.activeListings}
              trend="3 new this week"
            />
            <MetricCard 
              icon={<FiTruck className="text-purple-500" />}
              title="Pending Shipments"
              value={metricsData.supplier.pendingShipments}
              trend="2 delayed"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-lg text-gray-800 mb-4 flex items-center">
          <FiClock className="mr-2 text-blue-500" /> Recent Activity
        </h3>
        <ul className="space-y-3">
          {recentActivities.map((activity, index) => (
            <li key={index} className="flex items-start">
              <div className={`p-1 rounded-full mr-3 mt-1 ${
                activity.type === 'order' ? 'bg-blue-100' : 
                activity.type === 'alert' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {activity.type === 'order' ? <FiTruck className="text-blue-500" /> :
                 activity.type === 'alert' ? <FiAlertCircle className="text-red-500" /> : 
                 <FiPackage className="text-green-500" />}
              </div>
              <div>
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Alerts Panel */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100">
        <h3 className="font-medium text-lg text-gray-800 mb-4 flex items-center">
          <FiAlertTriangle className="mr-2 text-red-500" /> Priority Alerts
        </h3>
        <ul className="space-y-2">
          {alertsData.map((alert, index) => (
            <li key={index} className="flex items-start">
              <div className="text-red-500 mr-2 mt-0.5">•</div>
              <p className="text-sm">{alert.message}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-lg text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions[currentRole].map((action, index) => (
            <button 
              key={index}
              className="flex flex-col items-center justify-center p-3 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="text-blue-500 mb-1">{action.icon}</div>
              <span className="text-sm text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ icon, title, value, trend }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
    <div className="flex items-center justify-between">
      <div className="text-gray-500">{icon}</div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value || '-'}</p>
        <p className="text-xs text-gray-400">{trend}</p>
      </div>
    </div>
  </div>
);

export default DashboardPage;