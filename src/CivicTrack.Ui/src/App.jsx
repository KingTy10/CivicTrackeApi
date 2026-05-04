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
  const [role, setRole] = useState(localStorage.getItem('role') || '');
const userEmail = email;

  const fetchRequests = async () => {
    try {
      const response = await api.get('/ServiceRequest');
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const fetchAllRequests = async () => {
    try {
     
      const response = await api.get('/ServiceRequest/all'); 
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch all requests", err);
      setMessage("Error: Could not load worker data.");
    }
  };

  useEffect(() => {
  if (token) {
    const userRole = localStorage.getItem('role');
    
    if (userRole === 'Worker' || userRole === 'Admin') {
      fetchAllRequests(); 
    } else {
      fetchRequests();    
    }
  }
}, [token]);

const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await api.post('/Account/login', { email, password });
        
        console.log("Full Backend Response:", response.data);
       
        const userRole = response.data.role || response.data.Role;
        const userToken = response.data.token || response.data.Token;

        if (userRole) {
            localStorage.setItem('token', userToken);
            localStorage.setItem('role', userRole); 
            setToken(userToken);
            setRole(userRole);
            setMessage("Logged in as " + userRole);
        } else {
            console.error("No role found in response:", response.data);
            setMessage("Login successful, but no role assigned.");
        }
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
    // Adding reporterEmail ensures the database can track who created the issue
    await api.post('/ServiceRequest', { 
      title, 
      description, 
      reporterEmail: email // 'email' is your state variable from the login form
    });

    setTitle('');
    setDescription('');
    setMessage("Request submitted successfully!");

    // REFRESH LOGIC:
    const userRole = localStorage.getItem('role');
    if (userRole === 'Worker' || userRole === 'Admin') {
      fetchAllRequests(); 
    } else {
      fetchRequests();    
    }
  } catch (err) {
    console.error("Submission error:", err);
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

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      // We use JSON.stringify because the backend expects a simple string in the body
      await api.patch(`/ServiceRequest/${requestId}/status`, JSON.stringify(newStatus), {
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage(`Request marked as ${newStatus}!`);
      
      // Refresh logic to show the update immediately
      const userRole = localStorage.getItem('role');
      if (userRole === 'Worker' || userRole === 'Admin') {
        fetchAllRequests();
      } else {
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to update status", err);
      setMessage("Failed to update status.");
    }
  };

  const handleRequestToWork = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5038/api/ServiceRequest/${requestId}/request-to-work`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workerEmail: email }) 
      });

      if (response.ok) fetchAllRequests(); 
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAssignWorker = async (requestId, selectedWorkerEmail) => {
    if (!selectedWorkerEmail) return; 

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5038/api/ServiceRequest/${requestId}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workerEmail: selectedWorkerEmail }) 
      });

      if (response.ok) fetchAllRequests(); 
    } catch (error) {
      console.error("Error:", error);
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
          
         
          {localStorage.getItem('role') === 'Worker' && (
            <span className="ml-3 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider border border-amber-200">
              Worker Portal
            </span>
          )}
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
        {role === 'Resident' && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
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
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
    <h2 className="font-bold text-slate-800">
      {role === 'Resident' ? 'My Activity' : 'Service Requests Management'}
    </h2>
    {role === 'Worker' && <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Worker View</span>}
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
                  <>
                    {/* --- 1. RESIDENT VIEW --- */}
                    {role === 'Resident' && requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-center">
                          {req.status === 'Resolved' ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-blue-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{req.title}</div>
                          <div className="text-xs text-slate-500">Submitted on {new Date(req.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleCancelRequest(req.id)} className="p-2 text-slate-400 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* --- 2. WORKER VIEW --- */}
                    {role === 'Worker' && (
                      <>
                        {/* Section: Assigned to Me */}
                        <tr className="bg-indigo-50/50"><td colSpan="3" className="px-6 py-2 text-xs font-bold text-indigo-600">MY ASSIGNED TASKS</td></tr>
                        {requests.filter(r => r.assignedWorkerId === email).map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-center"><AlertCircle className="w-5 h-5 text-orange-500 mx-auto" /></td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">{req.title}</div>
                              <div className="text-xs text-indigo-600 font-bold">OFFICIALLY ASSIGNED TO YOU</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleUpdateStatus(req.id, "Resolved")} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Complete Task</button>
                            </td>
                          </tr>
                        ))}

                        {/* Section: Available */}
                        <tr className="bg-slate-50"><td colSpan="3" className="px-6 py-2 text-xs font-bold text-slate-500">AVAILABLE FOR INTEREST</td></tr>
                        {requests.filter(r => r.assignedWorkerId !== email).map((req) => (
                          <tr key={req.id} className="opacity-75">
                            <td className="px-6 py-4 text-center"><PlusCircle className="w-5 h-5 text-slate-400 mx-auto" /></td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-600">{req.title}</div>
                              <div className="text-xs text-slate-400">Reported by: {req.reporterEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleRequestToWork(req.id)} 
                              className="border border-indigo-600 text-indigo-600 px-3 py-1 rounded text-xs hover:bg-indigo-600 hover:text-white transition"
                            >
                              I'm Interested
                            </button>
                          </td>
                          </tr>
                        ))}
                      </>
                    )}

                   {/* --- 3. ADMIN VIEW --- */}
                    {role === 'Admin' && requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-center">
                          {/* Updated to check for assignedWorkerId */}
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${req.assignedWorkerId ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {req.assignedWorkerId ? 'Assigned' : 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{req.title}</div>
                          <div className="text-xs text-slate-500">From: {req.reporterEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <select 
                            className="text-xs border rounded p-1 outline-none focus:ring-1 focus:ring-indigo-500"
                            onChange={(e) => handleAssignWorker(req.id, e.target.value)}
                            value={req.assignedWorkerId || ""} 
                          >
                            <option value="">Assign Worker...</option>
                            
                            {req.requestedByWorkerId && req.requestedByWorkerId !== req.assignedWorkerId && (
                              <option value={req.requestedByWorkerId}>
                                Interested: {req.requestedByWorkerId}
                              </option>
                            )}

                            <option value="Test@gmail.com">Test@gmail.com (Worker)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-400">No service requests found.</td></tr>
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
