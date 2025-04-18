import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileContext } from '../../context';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { Loader } from '../../common/Loader';

import styles from './Leaderboard.module.css';

// Временные данные для отображения, если запрос не выполнен
const mockData = [
  { firstname: 'Player 1', score: 10054 },
  { firstname: 'Player 2', score: 9000 },
  { firstname: 'Player 3', score: 8000 },
  { firstname: 'Player 4', score: 7000 },
  { firstname: 'Player 5', score: 6000 },
  { firstname: 'Player 6', score: 5000 },
  { firstname: 'Player 7', score: 4000 },
  { firstname: 'Player 8', score: 3000 },
  { firstname: 'Player 9', score: 2000 },
  { firstname: 'Player 10', score: 1000 },
];

export const Leaderboard = () => {
  const { t } = useTranslation();
  const { profile } = useContext(ProfileContext);
  
  // Используем кастомный хук для получения данных лидерборда
  const { data, isLoading, error } = useLeaderboard();

  // Используем полученные данные или заглушку, если данные загружаются
  const leaderboardData = data || mockData;

  // Показываем лоадер на весь экран, пока данные загружаются
  if (isLoading) {
    return (
      <div className={styles.loaderOverlay}>
        <Loader />
      </div>
    );
  }

  // Если произошла ошибка при загрузке данных
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{t('leaderboard.error', 'Error loading leaderboard data')}</div>
      </div>
    );
  }

  console.log('profile',profile);

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>{t('leaderboard.title')}</div>
      <div className={styles.rank}>
        {t('leaderboard.yourRank')}
        <div className={styles.rankNumber}>#142</div>
        <div className={styles.rankScore}>{profile?.score || 0} {t('leaderboard.points')}</div>
      </div>
      <div className={styles.playerList}>
        {leaderboardData.map((player, index) => {
          return (
            <div className={styles.playerItem} key={index}>
              <span className={styles.playerRank}>{index + 1}.</span>
              <span className={styles.playerName}>{player.firstname}</span>
              <span className={styles.playerScore}>{player.score}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
};