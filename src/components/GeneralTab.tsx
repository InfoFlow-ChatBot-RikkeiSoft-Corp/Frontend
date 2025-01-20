import React, { useContext } from 'react';
import { Theme, UserContext } from '../UserContext';
import { useTranslation } from 'react-i18next';

const GeneralTab: React.FC = () => {
  const { userSettings, setUserSettings } = useContext(UserContext);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full w-full p-4 bg-white dark:bg-gray-850 rounded-lg shadow-md">
      <div className="flex items-center justify-between text-white h-full w-full">
        <label htmlFor="theme" className='theme-text'>{t('theme-label')}</label>
        <select
          id="theme"
          name="theme"
          className="custom-select text-white dark:custom-select border-gray-300 border rounded p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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