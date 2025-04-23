import React, { useContext, useState } from 'react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Header from './common/Header';
import Footer from '../components/common/Footer';
import Sidebar from './common/Sidebar';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ pageTitle, children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Lift collapsed state to Layout
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  // Extract the role from user (assume role is stored as user.roleName)
  const role = user ? user.roleName : null;

  // Adjust main container margin based on sidebar width
  const sidebarWidth = sidebarCollapsed ? '80px' : '200px';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Pass collapsed state and toggle function to Sidebar */}
      <Sidebar role={role} onLogout={handleLogout} collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="main-container" style={{ marginLeft: sidebarWidth, 
    maxWidth: `calc(100% - ${sidebarWidth})` }}>
        {/* Header receives the toggle function */}
        <Header pageTitle={pageTitle} user={user} toggleSidebar={toggleSidebar} />
        <main className="flex-fill p-4">
          {children}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
