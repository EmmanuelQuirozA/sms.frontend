// src/components/Sidebar.js
import React from 'react';
import {
  MDBContainer,
  MDBTooltip,
  MDBListGroup,
  MDBListGroupItem,
  MDBBtn,
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next'; // Translations

const Sidebar = ({ role, onLogout, collapsed, toggleSidebar }) => {
  const { t } = useTranslation();

  const menuItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          {
            level: 'Dashboards',
            items: [
              { name: 'dashboard', icon: 'bi bi-grid', link: '/admin/AdminDashboard' },
            ],
          },
          {
            level: 'Management',
            items: [
              { name: 'schools', icon: 'bi bi-building', link: '/admin/schools' },
              { name: 'finance', icon: 'bi bi-person-fill', link: '/admin/finance' },
              { name: 'users', icon: 'fa-solid fa-user-graduate', link: '/admin/users' },
            ],
          },
          {
            level: 'Settings',
            items: [
              { name: 'settings', icon: 'bi bi-gear', link: '/admin/settings' },
            ],
          },
        ];
      case 'SCHOOL_ADMIN':
        return [
          {
            level: 'Dashboards',
            items: [
              { name: 'dashboard', icon: 'bi bi-house-fill', link: '/school-admin/dashboard' },
            ],
          },
          {
            level: 'Management',
            items: [
              { name: 'teachers', icon: 'bi bi-person-fill', link: '/school-admin/teachers' },
              { name: 'students', icon: 'bi bi-people-fill', link: '/school-admin/students' },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const groups = menuItems();

  return (
    <div>
      {/* Sidebar Container */}
      <MDBContainer
        id="sidebar"
        className={`sidebar ${collapsed ? 'collapsed' : ''} d-flex flex-column`}
        style={{ width: collapsed ? '80px' : '250px' }}
      >
        <div className="logo-details d-flex justify-content-center" style={{ margin: '20px' }}>
          <img className="logo_img" src="../monarch_logo.png" alt="Logo" />
          {!collapsed && <span className="logo_name ms-2">Monarch</span>}
        </div>

        {/* Menu */}
        <MDBListGroup light className="mb-auto" >
          {groups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.items.map((item, index) => (
                <MDBListGroupItem
                  key={index}
                  tag="a"
                  href={item.link}
                  className={collapsed ? 'd-flex justify-content-center' : ''}
                  style={{ border: 'none', background: 'transparent', fontSize: '20px', color: 'white', padding: collapsed ?'1rem 5px':'' }}
                >
                  <MDBTooltip tag="span" title={t(item.name)} placement="right">
                    <i className={item.icon}></i>
                  </MDBTooltip>
                  {!collapsed && <span className="link_name ms-2">{t(item.name)}</span>}
                </MDBListGroupItem>
              ))}
              {groupIndex < groups.length - 1 && (
                <hr style={{ margin: '10px 0', borderTop: '1px solid rgba(255,255,255)' }} />
              )}
            </React.Fragment>
          ))}
        </MDBListGroup>

        {/* Profile and Logout */}
        <div className="d-flex justify-content-center p-2">
          <MDBBtn className="p-2 btn" onClick={onLogout}>
            <i className="bi bi-box-arrow-left" style={{ fontSize: '12px' }}></i>
          </MDBBtn>
        </div>
      </MDBContainer>
    </div>
  );
};

export default Sidebar;
