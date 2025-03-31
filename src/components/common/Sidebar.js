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
              { name: 'dashboard', icon: 'bi bi-grid', link: '/admin/dashboard' },
            ],
          },
          {
            level: 'Management',
            items: [
              { name: 'schools', icon: 'bi bi-building', link: '/admin/schools' },
              { name: 'finance', icon: 'bi bi-coin', link: '/admin/finance', comingSoon: true },
              { name: 'users', icon: 'fa-solid fa-user-graduate', link: '/admin/users' },
            ],
          },
          {
            level: 'Settings',
            items: [
              { name: 'settings', icon: 'bi bi-gear', link: '/admin/settings', comingSoon: true },
            ],
          },
        ];
      case 'SCHOOL_ADMIN':
        return [
          {
            level: 'Dashboards',
            items: [
              { name: 'dashboard', icon: 'bi bi-house-fill', link: '/schooladmin/dashboard' },
            ],
          },
          {
            level: 'Management',
            items: [
              { name: 'finance', icon: 'bi bi-coin', link: '/schooladmin/finance', comingSoon: true },
              { name: 'schools', icon: 'bi bi-building', link: '/schooladmin/schools' },
              { name: 'users', icon: 'bi bi-person-badge', link: '/schooladmin/users' },
              { name: 'teachers', icon: 'bi bi-briefcase', link: '/schooladmin/teachers' },
              { name: 'students', icon: 'bi bi-mortarboard', link: '/schooladmin/students' },
              { name: 'parents', icon: 'bi bi-people-fill', link: '/schooladmin/parents', comingSoon: true },
              { name: 'subjects', icon: 'bi bi-journal-text', link: '/schooladmin/subjects', comingSoon: true },
              { name: 'classes', icon: 'bi bi-card-checklist', link: '/schooladmin/classes', comingSoon: true },
              { name: 'lessons', icon: 'bi bi-book', link: '/schooladmin/lessons', comingSoon: true },
              { name: 'exams', icon: 'bi bi-pencil-square', link: '/schooladmin/exams', comingSoon: true },
              { name: 'assignments', icon: 'bi bi-file-earmark-text', link: '/schooladmin/assignments', comingSoon: true },
              { name: 'results', icon: 'bi bi-bar-chart-line', link: '/schooladmin/results', comingSoon: true },
              { name: 'attendance', icon: 'bi bi-calendar-check', link: '/schooladmin/attendance', comingSoon: true },
              { name: 'events', icon: 'bi bi-calendar-event', link: '/schooladmin/events', comingSoon: true },
              { name: 'messages', icon: 'bi bi-chat-dots', link: '/schooladmin/messages', comingSoon: true },
              { name: 'announcements', icon: 'bi bi-megaphone', link: '/schooladmin/announcements', comingSoon: true },
            ],
          },
          {
            level: 'Settings',
            items: [
              { name: 'profile', icon: 'bi bi-person-circle', link: '/profile' },
              { name: 'settings', icon: 'bi bi-gear', link: '/settings' },
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
        style={{ width: collapsed ? '80px' : '200px' }}
      >
        <div className="logo-details d-flex justify-content-center" style={{ margin: '20px 0' }}>
          <img className="logo_img" src="../monarch_logo.png" alt="Logo" />
          {!collapsed && <span className="logo_name ms-2">Monarch</span>}
        </div>

        <MDBListGroup 
          light 
          className="mb-auto" 
          style={{ 
            overflowY: 'auto', 
            scrollbarWidth: 'none',           // Firefox
            msOverflowStyle: 'none'           // IE and Edge
          }}
        >
          {groups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.items.map((item, index) => {
                // Determine if this item is "coming soon"
                const comingSoon = item.comingSoon;
                return (
                  <MDBTooltip 
                    tag="span" 
                    title={t(item.name)} 
                    placement="right" 
                    key={index} 
                  >
                    <MDBListGroupItem
                      tag="a"
                      href={comingSoon ? '#' : item.link} // Disable link if coming soon
                      className={collapsed ? 'd-flex justify-content-center pb-1 pt-1 position-relative' : 'pb-1 pt-1 position-relative'}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'white',
                        padding: collapsed ? '1rem 5px' : '',
                        opacity: comingSoon ? 0.5 : 1,
                        pointerEvents: comingSoon ? 'none' : 'auto'
                      }}
                    >
                      <i className={item.icon}></i>
                      {!collapsed && <span className="link_name ms-2">{t(item.name)}</span>}
                      {!collapsed && comingSoon && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: '#ed7d31',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '2px 4px',
                            borderRadius: '0 4px 0 4px'
                          }}
                        >
                          {t('coming_soon')}
                        </span>
                      )}
                      {collapsed && comingSoon && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            backgroundColor: '#ed7d31',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '2px 4px',
                            borderRadius: '0 4px 0 4px'
                          }}
                        >
                          <i className={'bi-info-circle'}></i>
                        </span>
                      )}
                    </MDBListGroupItem>
                  </MDBTooltip>
                );
              })}
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
