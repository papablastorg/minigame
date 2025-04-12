import React from 'react';
import { NavLink } from "react-router";
import './Nav.css';
import { Game, AirDrop, Leaderboard, Referral } from '../icons';
import { CONFIG } from '../../config';

export const Nav: React.FC = () => {
  const baseUrl = CONFIG.BASE_URL;
  
  return (
    <div className="nav">
      <NavLink className='link' to={`${baseUrl}`} end>
      <Game />
      <span>Game</span>
      </NavLink>
      <NavLink className='link' to={`${baseUrl}referral`} end>
      <Referral />
      <span>Referral</span>
      </NavLink>
      <NavLink className='link' to={`${baseUrl}leaderboard`} end>
      <Leaderboard />
      <span>Leaderboard</span>
      </NavLink>
      <NavLink className='link' to={`${baseUrl}airdrop`} end>
      <AirDrop />
      <span>AirDrop</span>
      </NavLink>
    </div>
  );
};