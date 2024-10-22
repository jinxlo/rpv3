// src/pages/Login.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Attempting login:', data.email);
      
      const response = await axios.post('http://localhost:5000/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      if (response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', response.data.isAdmin);
        
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }

        // Redirect based on role
        if (response.data.isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error.response || error);
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Login</h2>
        </div>
        <div className="card-content">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="form-item">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="form-input"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div className="form-item">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IoEyeOffSharp className="icon" />
                  ) : (
                    <IoEyeSharp className="icon" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="form-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;