import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Logout function that clears localStorage and updates state
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optionally, redirect to login page (or use a navigation hook in your components)
    window.location.href = '/login';
  };

  // On mount, check localStorage for a token/user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if the token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          const userData = localStorage.getItem('user');
          if (userData) {
            setUser(JSON.parse(userData));
          }
          // Calculate time remaining until token expiration
          const timeout = decoded.exp * 1000 - Date.now();
          const timer = setTimeout(() => {
            logout();
          }, timeout);
          // Clean up the timer if the component unmounts or token changes
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
      }
    }
  }, []);

  const login = (data) => {
    // Save token and user data in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Optionally, set a logout timer here as well if you want to handle token expiration immediately
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};