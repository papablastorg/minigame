import { useTranslation } from 'react-i18next';
import { Telegram } from '../icons';
import styles from './AirDrop.module.css';
import { ImagePreloader } from '../../common/ImagePreloader';

export const AirDrop = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.airDropContainer}>
        <div className={styles.header}>{t('airdrop.title')}</div>
        <p className={styles.comingSoon}>{t('airdrop.comingSoon')}</p>
        <div className={styles.airDropImage}>
          <ImagePreloader src="images/airdrop.png" alt="airdrop" />
        </div>
        <div className={styles.airDropButtonContainer}>
          <button onClick={() => window.open('https://t.me/papablast_news', '_blank')} className={styles.joinChanelButton}>
            <Telegram />
            {t('airdrop.joinChannel')}
          </button>
        </div>
      </div>
  );
};