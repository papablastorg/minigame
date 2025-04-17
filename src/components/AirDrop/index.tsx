import { useTranslation } from 'react-i18next';
import { Telegram } from '../icons';
import styles from './AirDrop.module.css';

export const AirDrop = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.airDropContainer}>
        <div className={styles.header}>{t('airdrop.title')}</div>
        <p className={styles.comingSoon}>{t('airdrop.comingSoon')}</p>
        <img width={300} height={300} src="images/airdrop.png" alt="AirDrop" className={styles.airDropImage} />
        <div className={styles.airDropButtonContainer}>
          <button onClick={() => window.open('https://t.me/blum/app?startapp=memepadjetton_PAPA_WMm5z-ref_i6eMS3S5Fj', '_blank')} className={styles.joinChanelButton}>
            <Telegram />
            {t('airdrop.joinChannel')}
          </button>
        </div>
      </div>
  );
};