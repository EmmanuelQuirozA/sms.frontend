// src/components/common/Header.js
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
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
  MDBBtn,
  MDBInputGroup
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

  // Search state for student lookup
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Trigger search when at least 2 characters are typed
  const handleSearchChange = (e) => {
    const token = localStorage.getItem('token');
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 3) {
      axios
        .get(`http://localhost:8080/api/students/list?lang=${i18n.language}&search_criteria=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setSearchResults(response.data);
        })
        .catch((err) => {
          console.error("Error fetching student search results:", err);
        });
    } else {
      setSearchResults([]);
    }
  };

  // Helper: split the full_name value; e.g. "1-John Does Smith" becomes "John Does Smith"
  const parseStudentName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split('-');
    return parts.length > 1 ? parts.slice(1).join('-').trim() : fullName;
  };

  // When a search result is clicked, navigate to the detail page and clear results
  const handleResultClick = (student) => {
    // Assume student object contains a student_id field; if not, use the first part of full_name
    const studentId = student.student_id || (student.full_name.split('-')[0]);
    setSearchResults([]);
    setSearchQuery('');
    navigate(`/studentdetail/${studentId}`);
  };

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
        <div className="d-flex align-items-center gap-4 position-relative">
          {/* Language Switcher Dropdown */}
          <MDBDropdown>
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
          
          {/* Search Input */}
          {user ? (
            <MDBContainer>
              <MDBInputGroup>
                <MDBInput 
                  label={t('search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MDBBtn rippleColor="dark">
                  <MDBIcon icon="search" />
                </MDBBtn>
              </MDBInputGroup>
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      {parseStudentName(result.full_name)}
                    </div>
                  ))}
                </div>
              )}
            </MDBContainer>
          ) : (null)}
          {/* User Authentication Dropdown */}
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
