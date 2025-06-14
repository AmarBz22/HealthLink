import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiUnlock, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const UsersManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banningUserId, setBanningUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // First verify if user is admin
        const userResponse = await axios.get('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (userResponse.data.role !== 'Admin') {
          toast.error('Unauthorized access');
          return;
        }

        setIsAdmin(true);
        setCurrentAdminId(userResponse.data.id);
        
        // Then fetch users if admin
        const usersResponse = await axios.get('http://localhost:8000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setUsers(usersResponse.data.users || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetchUsers();
  }, [navigate]);

  const openConfirmationModal = (userId, action) => {
    const user = users.find(u => u.id === userId);
    
    // Prevent admin from banning themselves
    if (userId === currentAdminId) {
      toast.warning('You cannot ban your own admin account');
      return;
    }
    
    setSelectedUser(user);
    setCurrentAction(action);
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setSelectedUser(null);
    setCurrentAction(null);
  };

  const confirmAction = async () => {
    if (!selectedUser || !currentAction) return;
    
    try {
      setBanningUserId(selectedUser.id);
      const token = localStorage.getItem('authToken');
      
      if (currentAction === 'ban') {
        await axios.post(`http://localhost:8000/api/users/${selectedUser.id}/ban`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, banned: true } : user
        ));
        toast.success('User banned successfully');
      } else {
        await axios.post(`http://localhost:8000/api/users/${selectedUser.id}/unban`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, banned: false } : user
        ));
        toast.success('User unbanned successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${currentAction} user`);
    } finally {
      setBanningUserId(null);
      closeConfirmationModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#00796B] text-white rounded-md hover:bg-[#00695C] transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showConfirmationModal ? 'blur-sm' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('registration-requests')}
                className="text-sm bg-[#00796B] text-white px-4 py-2 rounded-md hover:bg-[#00695C] transition-colors"
              >
                View Registration Requests
              </button>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#B2DFDB] text-[#00796B]">
                Admin View
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FiPhone className="mr-2 text-gray-400" />
                        {user.phone_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMapPin className="mr-2 text-gray-400" />
                        {user.wilaya || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.banned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {user.banned ? (
                          <button
                            onClick={() => openConfirmationModal(user.id, 'unban')}
                            disabled={banningUserId === user.id || user.id === currentAdminId}
                            className={`text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-gray-100 ${
                              banningUserId === user.id ? 'opacity-50' : ''
                            } ${
                              user.id === currentAdminId ? 'cursor-not-allowed opacity-30' : ''
                            }`}
                            title={user.id === currentAdminId ? "Cannot unban yourself" : "Unban User"}
                          >
                            {banningUserId === user.id ? (
                              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-600 rounded-full"></div>
                            ) : (
                              <FiUnlock className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => openConfirmationModal(user.id, 'ban')}
                            disabled={banningUserId === user.id || user.id === currentAdminId}
                            className={`text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100 ${
                              banningUserId === user.id ? 'opacity-50' : ''
                            } ${
                              user.id === currentAdminId ? 'cursor-not-allowed opacity-30' : ''
                            }`}
                            title={user.id === currentAdminId ? "Cannot ban yourself" : "Ban User"}
                          >
                            {banningUserId === user.id ? (
                              <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full"></div>
                            ) : (
                              <FiLock className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Confirm {currentAction === 'ban' ? 'Ban' : 'Unban'} User
              </h3>
              <button 
                onClick={closeConfirmationModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <p className="mb-6 text-gray-600">
              Are you sure you want to {currentAction} {selectedUser?.first_name} {selectedUser?.last_name} (ID: {selectedUser?.id})?
              {currentAction === 'ban' && (
                <span className="block mt-2 text-red-500">
                  This will prevent the user from accessing their account.
                </span>
              )}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmationModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded-md text-white focus:outline-none ${
                  currentAction === 'ban' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                disabled={banningUserId === selectedUser?.id}
              >
                {banningUserId === selectedUser?.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Confirm ${currentAction === 'ban' ? 'Ban' : 'Unban'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersManagementPage;