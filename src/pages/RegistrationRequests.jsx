import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCheck, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const RegistrationRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://192.168.43.101:8000/api/admin/registration-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        setRequests(response.data.requests || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load registration requests');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const handleRequestAction = async (id, action) => {
    try {
      setProcessingId(id);
      const token = localStorage.getItem('authToken');
      const endpoint = action === 'approve' 
        ? `approve-request/${id}`
        : `reject-request/${id}`;

      await axios.post(`http://192.168.43.101:8000/api/admin/${endpoint}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setRequests(requests.filter(request => request.id !== id));
      toast.success(`Request ${action}d successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00796B]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Registration Requests</h2>
          <button
            onClick={() => navigate('/users')}
            className="text-sm text-[#00796B] hover:text-[#00695C] font-medium cursor-auto"
          >
            Back to Users Management
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
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
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No pending registration requests
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.first_name} {request.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMail className="mr-2 text-gray-400" />
                        {request.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FiPhone className="mr-2 text-gray-400" />
                        {request.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiMapPin className="mr-2 text-gray-400" />
                        {request.wilaya}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Registered: {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleRequestAction(request.id, 'approve')}
                          disabled={processingId === request.id}
                          className={`text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-gray-100 ${
                            processingId === request.id ? 'opacity-50' : ''
                          }`}
                          title="Approve Request"
                        >
                          {processingId === request.id ? (
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-600 rounded-full"></div>
                          ) : (
                            <FiCheck className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'reject')}
                          disabled={processingId === request.id}
                          className={`text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-gray-100 ${
                            processingId === request.id ? 'opacity-50' : ''
                          }`}
                          title="Reject Request"
                        >
                          {processingId === request.id ? (
                            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full"></div>
                          ) : (
                            <FiX className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationRequestsPage;