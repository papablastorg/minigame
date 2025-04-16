import React, { ReactNode } from 'react';
import { Nav } from './Nav';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        {children}
      </div>
      <div className={styles.nav}>
        <Nav />
      </div>
    </div>
  );
};