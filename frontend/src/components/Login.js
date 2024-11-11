import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import loginImage from '../images/login.png';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (username === 'admin' && password === 'admin') {
        navigate('/admin');
        return;
      }

      const response = await axios.post('https://emp-management-hbon.onrender.com/api/login', {
        id: username,
        password
      });

      if (response.data.success) {
        navigate(`/employee/${username}`);
      }
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img src={loginImage} alt="Login" />
      </div>
      <div className="form-container">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4 relative">
              <label className="block text-gray-700 mb-2">Username/ID</label>
              <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 pl-10 border rounded"
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700 mb-2">Password</label>
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pl-10 border rounded"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default Login;