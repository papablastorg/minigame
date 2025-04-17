import styles from './Leaderboard.module.css';
import { useTranslation } from 'react-i18next';

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
  { name: 'Player 11', score: 900 },
  { name: 'Player 12', score: 800 },
  { name: 'Player 13', score: 700 },
  { name: 'Player 14', score: 600 },
  { name: 'Player 15', score: 500 },
  { name: 'Player 16', score: 400 },
  { name: 'Player 17', score: 300 },
  { name: 'Player 18', score: 200 },
  { name: 'Player 19', score: 100 },
  { name: 'Player 20', score: 99 },
];

export const Leaderboard = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>{t('leaderboard.title')}</div>
      <div className={styles.rank}>
        {t('leaderboard.yourRank')}
        <div className={styles.rankNumber}>#142</div>
        <div className={styles.rankScore}>1250 {t('leaderboard.points')}</div>
      </div>
      <div className={styles.playerList}>
        {data.map((player, index) => {
          return (
            <div className={styles.playerItem} key={index}>
              <span className={styles.playerRank}>{index + 1}.</span>
              <span className={styles.playerName}>{player.name}</span>
              <span className={styles.playerScore}>{player.score}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
};