import { Telegram } from '../icons';
import styles from './AirDrop.module.css';

export const AirDrop = () => {
  return (
    <div className={styles.airDropContainer}>
        <div className={styles.header}>AIRDROP</div>
        <p className={styles.comingSoon}>Cooming soon...</p>
        <img width={300} height={300} src="images/airdrop.png" alt="AirDrop" className={styles.airDropImage} />
        <div className={styles.airDropButtonContainer}>
          <button onClick={() => window.open('https://t.me/blum/app?startapp=memepadjetton_PAPA_WMm5z-ref_i6eMS3S5Fj', '_blank')} className={styles.joinChanelButton}>
            <Telegram />
            Join Chanel
          </button>
        </div>
      </div>
  );
};