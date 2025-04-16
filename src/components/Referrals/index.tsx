import { useCallback, useState } from 'react';

import styles from './Referrals.module.css';

const data = [
  { name: 'Player 1', score: 10054 },
  { name: 'Player 2', score: 9000 },
  { name: 'Player 3', score: 8000 },
  { name: 'Player 4', score: 7000 },
  { name: 'Player 5', score: 6000 },
  { name: 'Player 6', score: 5000 },
  { name: 'Player 7', score: 4000 },
  { name: 'Player 8', score: 3000 },
  { name: 'Player 9', score: 2000 },
  { name: 'Player 10', score: 1000 },
];

const referralCount: number = 10;

export const Referrals = () => {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    setCopied(true);
    if(!copied) {
      navigator.clipboard.writeText('https://t.me/referral_bot?start=123');
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
  }, [copied]);

  return (
    <div className={styles.referralsContainer}>
    <div className={styles.header}>REFERRALS</div>
    <img width={250} height={250} src='images/referrals.png' alt="referral" className={styles.referralImage} />
    <button onClick={copyLink} className={styles.referralButton}>{copied ? 'Copied!' : 'Copy link'}</button>
    <p className={styles.referralText}>Earn 100% from each referral's earnings</p>
    {referralCount === 0 ? <p className={styles.referralCount}>
      You <span>don't have</span> any referrals
    </p> : <p className={styles.referralCount}>
      You have
      <span>{referralCount}</span> 
      {referralCount > 1 ? 'referrals' : 'referral'}
    </p>}
    {referralCount > 0 && <div className={styles.playerList}>
      {data.map((player, index) => {
        return (
          <div className={styles.playerItem} key={index}>
            <span className={styles.playerRank}>{index + 1}.</span>
            <span className={styles.playerName}>{player.name}</span>
            <span className={styles.playerScore}>{player.score}</span>
          </div>
        )
      })}
    </div>}
  </div>
  );
};