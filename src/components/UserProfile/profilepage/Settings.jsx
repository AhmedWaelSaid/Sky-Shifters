import React from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

export default function Settings() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <MainContent />
    </div>
  );
} 