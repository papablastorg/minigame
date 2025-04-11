import React, { ReactNode } from 'react';
import { Nav } from './Nav';
import './layout.css';

interface LayoutProps {
    children: ReactNode;
  }

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <div className="content">
        {children}
      </div>
      <div className="nav">
        <Nav />
      </div>
    </div>
  );
};