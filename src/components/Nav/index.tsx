import { NavLink } from "react-router";
import styles from './Nav.module.css';
import { Game, AirDrop, Leaderboard, Referral } from '../icons';
import { CONFIG } from '../../config';

export const Nav = () => {
  const baseUrl = CONFIG.BASE_URL;
  
  return (
    <div className={styles.nav}>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}`} end>
        <Game />
        <span>Game</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}referral`} end>
        <Referral />
        <span>Referral</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}leaderboard`} end>
        <Leaderboard />
        <span>Leaderboard</span>
      </NavLink>
      <NavLink className={({ isActive }) => isActive ? styles.active : styles.link} to={`${baseUrl}airdrop`} end>
        <AirDrop />
        <span>AirDrop</span>
      </NavLink>
    </div>
  );
};