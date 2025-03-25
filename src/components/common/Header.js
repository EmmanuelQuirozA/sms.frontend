// src/components/common/Header.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import {
  MDBNavbar,
  MDBContainer,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBInput,
  MDBBtn
} from 'mdb-react-ui-kit';

const Header = ({ pageTitle, user, toggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Fallback to 'EN' if i18n.language is undefined.
  const currentLanguage = i18n.language ? i18n.language.toUpperCase() : 'EN';

  return (
    <MDBNavbar light bgColor="light" className="py-2">
      <MDBContainer fluid>
        {/* Left Side: Sidebar Toggle and Page Title */}
        {user ? (
        <div className="d-flex align-items-center">
          <div
            onClick={toggleSidebar}
            style={{ cursor: 'pointer', marginRight: '1rem' }}
          >
            <MDBIcon fas icon="bars" />
          </div>
          <h2 className="mb-0" style={{ fontWeight:'Bold', color:'black'}}>{pageTitle}</h2>
        </div>):(<div/>)
        }

        {/* Right Side: Language Switcher and User Authentication */}
        <div className="d-flex align-items-center">
          
          {/* Language Switcher Dropdown */}
          <MDBDropdown className="me-3">
            <MDBDropdownToggle tag="button" className="btn btn-light p-2">
              <MDBIcon fas icon="globe" className="me-1" />
              {currentLanguage}
            </MDBDropdownToggle>
            <MDBDropdownMenu className="dropdown-menu">
              <MDBDropdownItem onClick={() => changeLanguage('es')} className="dropdown-item">
                Español
              </MDBDropdownItem>
              <MDBDropdownItem onClick={() => changeLanguage('en')} className="dropdown-item">
                English
              </MDBDropdownItem>
            </MDBDropdownMenu>
          </MDBDropdown>

          {/* User Authentication Links */}
          {user ? (
            <MDBDropdown>
              <MDBDropdownToggle tag="button" className="btn btn-primary p-2">
                {user.firstName || 'User'}
              </MDBDropdownToggle>
              <MDBDropdownMenu className="dropdown-menu">
                <MDBDropdownItem onClick={() => navigate('/profile')} className="dropdown-item">
                  {t('profile')}
                </MDBDropdownItem>
                <MDBDropdownItem onClick={() => navigate('/settings')} className="dropdown-item">
                  {t('settings')}
                </MDBDropdownItem>
                <MDBDropdownItem onClick={handleLogout} className="dropdown-item">
                  {t('logout')}
                </MDBDropdownItem>
              </MDBDropdownMenu>
            </MDBDropdown>
          ) : (null)}
        </div>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Header;
