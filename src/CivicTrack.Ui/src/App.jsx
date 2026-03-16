import { useState, useEffect } from 'react'
import api from './api'

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // 1. Function to Fetch Data
  const fetchRequests = async () => {
    try {
      const response = await api.get('/ServiceRequest'); // Your "My Requests" endpoint
      setRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  // 2. Load data automatically if we already have a token
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
      setToken(response.data.token); // This triggers the useEffect above
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
    fetchRequests(); // Refresh the table so the new one appears!
  } catch (err) {
    setMessage("Failed to submit request.");
  }
};
        const handleCancelRequest = async (requestId) => {
  if (!window.confirm("Are you sure you want to cancel this request?")) return;

  try {
    // We send "Cancelled" as a plain string in the body
    await api.patch(`/ServiceRequest/${requestId}/status`, "Cancelled", {
      headers: { 'Content-Type': 'application/json' }
    });
    
    setMessage("Request cancelled successfully.");
    fetchRequests(); // Refresh the table to show the new status
  } catch (err) {
    console.error(err);
    setMessage("Failed to cancel request. (Only residents can cancel their own)");
  }
};
  if (!token) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>CivicTrack Login</h1>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br/>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br/>
          <button type="submit">Login</button>
        </form>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>My Service Requests</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <section style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px' }}>
  <h3>Report a New Issue</h3>
  <form onSubmit={handleCreateRequest}>
    <input 
      placeholder="Title (e.g. Pothole)" 
      value={title} 
      onChange={(e) => setTitle(e.target.value)} 
      required 
    /><br/>
    <textarea 
      placeholder="Description" 
      value={description} 
      onChange={(e) => setDescription(e.target.value)} 
      required 
    /><br/>
    <button type="submit">Submit Request</button>
  </form>
</section>
   <table border="1" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
  <thead>
    <tr style={{ background: '#f4f4f4' }}>
      <th>ID</th>
      <th>Title</th>
      <th>Status</th>
      <th>Date Created</th>
      <th>Actions</th> {/* New Column */}
    </tr>
  </thead>
  <tbody>
    {requests.length > 0 ? (
      requests.map((req) => (
        <tr key={req.id}>
          <td>{req.id}</td>
          <td>{req.title}</td>
          <td><strong>{req.status}</strong></td>
          <td>{new Date(req.createdAt).toLocaleDateString()}</td>
          <td>
            {/* Show cancel button only if it's not already Resolved or Cancelled */}
            {req.status !== "Resolved" && req.status !== "Cancelled" && (
              <button 
                onClick={() => handleCancelRequest(req.id)}
                style={{ color: 'red', cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" style={{ textAlign: 'center' }}>No requests found.</td>
      </tr>
    )}
  </tbody>
</table>
    </div>
  );
}

export default App;