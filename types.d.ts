declare namespace Entities {
  interface Profile {
    _id: string;
    wallet?: string;
    telegramId: string;
    username?: string;
    firstname: string;
    referral: Entities.Profile.Referral;
  }

  namespace Profile {
    interface Referral {
      code: string;
      profile?: string;
    }
  }

  namespace Game {
    interface Score {
      value: number;
    }
  }
}
