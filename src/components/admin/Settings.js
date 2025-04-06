// src/pages/ConfigPage.js
import React, { useState } from 'react';
import Layout from '../Layout';
import {
  MDBContainer,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBIcon
} from 'mdb-react-ui-kit';

const ConfigPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleTabClick = (value) => {
    if (value === activeTab) return;
    setActiveTab(value);
  };

  return (
    <Layout pageTitle="Configuration">
      <MDBContainer className="py-4">
        <MDBCard>
          <MDBCardHeader>
            <h3 className="mb-0">Configuration Settings</h3>
          </MDBCardHeader>
          <MDBCardBody>
            <MDBTabs pills className="mb-3">
              <MDBTabsItem>
                <MDBTabsLink onClick={() => handleTabClick('profile')} active={activeTab === 'profile'}>
                  <MDBIcon fas icon="user" className="me-2" />Profile
                </MDBTabsLink>
              </MDBTabsItem>
              <MDBTabsItem>
                <MDBTabsLink onClick={() => handleTabClick('system')} active={activeTab === 'system'}>
                  <MDBIcon fas icon="cogs" className="me-2" />System
                </MDBTabsLink>
              </MDBTabsItem>
              <MDBTabsItem>
                <MDBTabsLink onClick={() => handleTabClick('contact')} active={activeTab === 'contact'}>
                  <MDBIcon fas icon="envelope" className="me-2" />Contact Us
                </MDBTabsLink>
              </MDBTabsItem>
            </MDBTabs>
            <MDBTabsContent>
              <MDBTabsPane show={activeTab === 'profile'}>
                <p>Placeholder content for Profile configuration.</p>
              </MDBTabsPane>
              <MDBTabsPane show={activeTab === 'system'}>
                <p>Placeholder content for System configuration.</p>
              </MDBTabsPane>
              <MDBTabsPane show={activeTab === 'contact'}>
                <p>Placeholder content for Contact Us configuration.</p>
              </MDBTabsPane>
            </MDBTabsContent>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </Layout>
  );
};

export default ConfigPage;
