import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function PageLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-layout">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title={title} onMenuToggle={() => setSidebarOpen(o => !o)} />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
