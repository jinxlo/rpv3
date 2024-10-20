// src/pages/Login.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoEyeSharp, IoEyeOffSharp } from 'react-icons/io5';
import '../assets/styles/Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithCode, setLoginWithCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [emailForCode, setEmailForCode] = useState('');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handlePasswordLogin = async (data) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      // Store token and isAdmin status in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', response.data.isAdmin);
      // Redirect based on role
      if (response.data.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid email or password');
    }
  };

  const handleEmailLogin = async (data) => {
    if (!codeSent) {
      try {
        await axios.post('/api/auth/send-login-code', { email: data.email });
        setCodeSent(true);
        setEmailForCode(data.email);
      } catch (error) {
        console.error('Error sending code:', error);
        alert('Error sending login code');
      }
    } else {
      try {
        const response = await axios.post('/api/auth/verify-login-code', {
          email: emailForCode,
          code: data.code,
        });
        // Store token and isAdmin status in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', response.data.isAdmin);
        // Redirect based on role
        if (response.data.isAdmin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        alert('Invalid or expired code');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Login</h2>
        </div>
        <div className="card-content">
          {!loginWithCode ? (
            <form onSubmit={handleSubmit(handlePasswordLogin)}>
              <div className="form-item">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register('email', { required: 'Email is required' })}
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
                    {...register('password', { required: 'Password is required' })}
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
              <div className="checkbox-container">
                <div>
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="form-checkbox"
                  />
                  <label className="form-label"> Remember me</label>
                </div>
                <button type="button" className="link-button">
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="form-button">
                Log in
              </button>
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Or{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setLoginWithCode(true)}
                >
                  Log in with Email Code
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleEmailLogin)}>
              {!codeSent ? (
                <>
                  <div className="form-item">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      {...register('email', { required: 'Email is required' })}
                      className="form-input"
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email.message}</p>
                    )}
                  </div>
                  <button type="submit" className="form-button">
                    Send Login Code
                  </button>
                </>
              ) : (
                <>
                  <div className="form-item">
                    <label className="form-label">Enter Code</label>
                    <input
                      type="text"
                      placeholder="Enter the code sent to your email"
                      {...register('code', { required: 'Code is required' })}
                      className="form-input"
                    />
                    {errors.code && (
                      <p className="form-error">{errors.code.message}</p>
                    )}
                  </div>
                  <button type="submit" className="form-button">
                    Verify Code and Log in
                  </button>
                </>
              )}
              <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Or{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setLoginWithCode(false)}
                >
                  Log in with Password
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
