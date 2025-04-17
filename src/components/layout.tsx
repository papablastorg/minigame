import React, { ReactNode } from 'react';
import { Nav } from './Nav';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <div className={styles.language}>
         <LanguageSwitcher />
      </div>
      <div className={styles.content}>
        {children}
      </div>
      <div className={styles.nav}>
        <Nav />
      </div>
    </div>
  );
};