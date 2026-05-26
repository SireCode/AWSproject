import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function PageLayout({ title, children }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <Header title={title} />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
