import { useState, useEffect } from 'react'
import api from './api'
import { 
  LogOut, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ClipboardList 
} from 'lucide-react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await api.get('/ServiceRequest');
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/Account/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setMessage("Logged in!");
    } catch (err) {
      setMessage("Login failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRequests([]);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ServiceRequest', { title, description });
      setTitle('');
      setDescription('');
      setMessage("Request submitted!");
      fetchRequests();
    } catch (err) {
      setMessage("Failed to submit request.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await api.patch(`/ServiceRequest/${requestId}/status`, "Cancelled", {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage("Request cancelled successfully.");
      fetchRequests();
    } catch (err) {
      setMessage("Failed to cancel request.");
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200 text-center">
          <div className="flex justify-center mb-4">
             <div className="bg-indigo-100 p-3 rounded-full">
                <ClipboardList className="w-8 h-8 text-indigo-600" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">CivicTrack</h1>
          <p className="text-slate-500 mb-8">Sign in to manage service requests</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition shadow-md"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-4 text-sm font-medium text-indigo-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CivicTrack</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800">Report a New Issue</h3>
          </div>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <input 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Title (e.g. Broken Streetlight)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
              placeholder="Provide more details about the location or issue..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
            <div className="flex items-center justify-between">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition shadow-sm"
              >
                Submit Request
              </button>
              {message && <span className="text-sm font-medium text-indigo-600">{message}</span>}
            </div>
          </form>
        </section>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">My Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Request Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-center">
                        {req.status === 'Resolved' && <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />}
                        {req.status === 'Cancelled' && <XCircle className="w-5 h-5 text-red-400 mx-auto" />}
                        {req.status === 'Pending' || req.status === 'New' ? 
                           <AlertCircle className="w-5 h-5 text-blue-500 mx-auto" /> : null
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{req.title}</div>
                        <div className="text-xs text-slate-500">Submitted on {new Date(req.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status !== "Resolved" && req.status !== "Cancelled" && (
                          <button 
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      No service requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; // THIS LINE IS CRITICAL
