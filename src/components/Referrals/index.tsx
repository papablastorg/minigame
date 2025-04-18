import { useCallback, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileContext } from '../../context';
import { useReferrals } from '../../hooks/useReferrals';
import { Loader } from '../../common/Loader';
import styles from './Referrals.module.css';
import { ImagePreloader } from '../../common/ImagePreloader';

const mockData = [
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
  const { profile } = useContext(ProfileContext);
  const { data: referrals, isLoading, error } = useReferrals();
  const { t } = useTranslation();

  const copyLink = useCallback(() => {
    setCopied(true);
    if (!copied) {
      navigator.clipboard.writeText(`https://t.me/papablast_bot?referral=${profile?.referral?.code || ''}`);
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    }
  }, [copied, profile]);

  if (isLoading) {
    return (
      <div className={styles.loaderOverlay}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{t('referrals.error', 'Error loading referral data')}</div>
      </div>
    );
  }

  const referralsData = referrals?.data || mockData;

  return (
    <div className={styles.referralsContainer}>
      <div className={styles.header}>{t('referrals.title')}</div>
      <div className={styles.referralImage}>
        <ImagePreloader src="images/referrals.png" alt="referral" />
      </div>
      <button onClick={copyLink} className={styles.referralButton}>
        {copied ? t('referrals.copied') : t('referrals.copyLink')}
      </button>
      <p className={styles.referralText}>{t('referrals.earnText')}</p>
      {referralCount === 0 ? (
        <p className={styles.referralCount}>
          {t('referrals.noReferrals')}
        </p>
      ) : (
        <p className={styles.referralCount}>
          {t('referrals.haveReferrals')}&nbsp;
          <span>{referralCount}</span>&nbsp;
          {t(referralCount > 1 ? 'referrals.referrals' : 'referrals.referral')}
        </p>
      )}
      {referralCount > 0 && (
        <div className={styles.playerList}>
          {referralsData.map((player, index) => {
            return (
              <div className={styles.playerItem} key={index}>
                <span className={styles.playerRank}>{index + 1}.</span>
                <span className={styles.playerName}>{player.firstname}</span>
                <span className={styles.playerScore}>{player.count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};