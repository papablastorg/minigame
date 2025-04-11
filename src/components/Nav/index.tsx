import React from 'react';
import { NavLink } from "react-router";
import './Nav.css';
import { Game, AirDrop, Leaderboard, Referral } from '../icons';
export const Nav: React.FC = () => {
  return (
    <div className="nav">
      <NavLink className='link' to="/" end>
      <Game />
      <span>Game</span>
      </NavLink>
      <NavLink className='link' to="/referral" end>
      <Referral />
      <span>Referral</span>
      </NavLink>
      <NavLink className='link' to="/leaderboard" end>
      <Leaderboard />
      <span>Leaderboard</span>
      </NavLink>
      <NavLink className='link' to="/airdrop" end>
      <AirDrop />
      <span>AirDrop</span>
      </NavLink>
    </div>
  );
};