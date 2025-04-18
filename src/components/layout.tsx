import { ReactNode } from 'react';
import { Nav } from './Nav';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Layout.module.css';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <a href="https://t.me/blum/app?startapp=memepadjetton_PAPA_WMm5z-ref_i6eMS3S5Fj" className={styles.coin}>
       <span>$PAPA</span>
      </a>
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