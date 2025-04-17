import { NavLink } from "react-router";
import { useTranslation } from 'react-i18next';
import styles from './Nav.module.css';
import { Game, AirDrop, Leaderboard, Referral } from '../icons';
import { CONFIG } from '../../config';

export const Nav = () => {
  const baseUrl = CONFIG.BASE_URL;
  const { t } = useTranslation();
  
  return (
    <div className={styles.nav}>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}`} end>
        <Game />
        <span>{t('nav.game')}</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}referral`} end>
        <Referral />
        <span>{t('nav.referral')}</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}leaderboard`} end>
        <Leaderboard />
        <span>{t('nav.leaderboard')}</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}airdrop`} end>
        <AirDrop />
        <span>{t('nav.airdrop')}</span>
      </NavLink>
    </div>
  );
};