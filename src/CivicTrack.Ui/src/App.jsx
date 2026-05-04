import { useState, useEffect } from 'react'
import api from './api'
import { 
  LogOut, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ClipboardList,
  UserPlus,
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react';

function App() {
  // State for Authentication
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  // State for Dashboard Data
  const [requests, setRequests] = useState([]);
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
      setMessage("Login failed. Check your credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Account/register', { email, password });
      setMessage("Account created! You can now login.");
      setIsRegistering(false);
      setPassword('');
    } catch (err) {
      setMessage("Registration failed. Use a stronger password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setRequests([]);
    setMessage("");
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

  // --- AUTH VIEW (Login & Register) ---
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
             <div className="bg-indigo-100 p-4 rounded-full">
                <ClipboardList className="w-10 h-10 text-indigo-600" />
             </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
            {isRegistering ? "Create Account" : "CivicTrack Login"}
          </h1>
          <p className="text-slate-500 text-center mb-8">
            {isRegistering ? "Register to report city issues" : "Welcome back to your city portal"}
          </p>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-slate-50"
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition bg-slate-50 pr-12"
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isRegistering ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setMessage(""); setShowPassword(false); }}
            className="w-full mt-6 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
          >
            {isRegistering ? "Already have an account? Sign In" : "New here? Create an account"}
          </button>
          
          {message && (
            <div className="mt-6 p-3 bg-indigo-50 rounded-lg text-center text-sm font-semibold text-indigo-700 border border-indigo-100">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (Residents) ---
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CivicTrack</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Report a New Issue</h3>
          </div>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <input 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              placeholder="Brief Title (e.g. Pothole on Main St)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            <textarea 
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] bg-slate-50"
              placeholder="Describe the issue in detail..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
            <div className="flex items-center justify-between pt-2">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
              >
                Submit Request
              </button>
              {message && <span className="text-sm font-bold text-indigo-600">{message}</span>}
            </div>
          </form>
        </section>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              My Service History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-20">Status</th>
                  <th className="px-6 py-4">Request Details</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-5 text-center">
                        {req.status === 'Resolved' && <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />}
                        {req.status === 'Cancelled' && <XCircle className="w-6 h-6 text-slate-300 mx-auto" />}
                        {(req.status === 'Pending' || req.status === 'New') && <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{req.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">Submitted {new Date(req.createdAt).toLocaleDateString()} • ID: #{req.id}</div>
                      </td>
                      <td className="px-6 py-5 text-right pr-8">
                        {req.status !== "Resolved" && req.status !== "Cancelled" && (
                          <button 
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                    <td colSpan="3" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-12 h-12 text-slate-200" />
                        <p className="text-slate-400 font-medium">You haven't submitted any requests yet.</p>
                      </div>
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

export default App;
