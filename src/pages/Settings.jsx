import React from 'react';
import Sidebar from '../components/UserProfile/profilepage/Sidebar';
import MainContent from '../components/UserProfile/profilepage/MainContent';

export default function Settings() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <MainContent />
    </div>
  );
} 