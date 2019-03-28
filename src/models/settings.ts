
export class UserSettings {
  public language: string;
  public currency: string;
  public wordlistLanguage: string;
  public darkMode: boolean;
  public notification: boolean;

  constructor() {}

  public static defaults(lang: string): UserSettings {
    const settings = new UserSettings();
    settings.language = lang;
    settings.currency = 'eur';
    settings.wordlistLanguage = 'french';
    settings.darkMode = false;
    settings.notification = false;

    return settings;
  }

}
