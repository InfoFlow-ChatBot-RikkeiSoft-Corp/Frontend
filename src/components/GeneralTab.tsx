import React, { useContext } from 'react';
import { Theme, UserContext } from '../UserContext';
import { useTranslation } from 'react-i18next';
import '../styles/GeneralTab.css';

const GeneralTab: React.FC = () => {
  const { userSettings, setUserSettings } = useContext(UserContext);
  const { t } = useTranslation();

  return (
    <div className={`general-tab ${userSettings.theme}`}>
      <div className="header">
        <label htmlFor="theme" className='theme-text'>{t('theme-label')}</label>
        <select
          id="theme"
          name="theme"
          className={`custom-select ${userSettings.theme}`}
          value={userSettings.userTheme}
          onChange={(e) =>
            setUserSettings({
              ...userSettings,
              userTheme: e.target.value as Theme,
            })
          }
        >
          <option value="dark">{t('dark-option')}</option>
          <option value="light">{t('light-option')}</option>
          <option value="system">{t('system-option')}</option>
        </select>
      </div>
    </div>
  );
};

export default GeneralTab;