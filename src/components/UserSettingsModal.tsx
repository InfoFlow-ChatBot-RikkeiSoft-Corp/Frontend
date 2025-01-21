import React, { useEffect, useRef, useState } from 'react';
import {
  CircleStackIcon,
  Cog6ToothIcon,
  XMarkIcon,
  LinkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import '../styles/UserSettingsModal.css';
import StorageTab from './StorageTab';
import WeblinkTab from './WeblinkTab';
import PromptTab from './PromptTab';
import GeneralTab from './GeneralTab';

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

enum Tab {
  GENERAL_TAB = 'General',
  STORAGE_TAB = 'Storage',
  WEBLINK_TAB = 'Weblink',
  PROMPT_TAB = 'Prompt',
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isVisible, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Track the active tab
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL_TAB);

  // We'll track isAdmin from localStorage
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // On mount or when modal becomes visible:
    if (isVisible) {
      setActiveTab(Tab.GENERAL_TAB);
    }

    // Check localStorage
    const adminFlag = localStorage.getItem('is_admin') === 'true';
    setIsAdmin(adminFlag);
  }, [isVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('is_admin');
        localStorage.removeItem('myapp_user_id'); // if you have it
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`Logout failed: ${errorData.error}`);
      }
    } catch (error) {
      alert('An error occurred during logout. Please try again.');
    }
  };

  return (
    <Transition show={isVisible} as={React.Fragment}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div
            ref={dialogRef}
            className="flex flex-col bg-white dark:bg-gray-850 rounded-lg w-full mx-auto overflow-hidden"
            style={{ height: '90vh', width: '170vh' }}
          >
            {/* Header */}
            <div
              id="user-settings-header"
              className="flex justify-between items-center border-b border-gray-200 p-4"
            >
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('settings-header')}
              </h1>
              <button
                onClick={handleClose}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <XMarkIcon className="h-8 w-8" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div id="user-settings-content" className="flex flex-1 overflow-auto relative">
              {/* Sidebar */}
              <div className="border-r border-gray-200 flex flex-col">
                {/* Always show GENERAL tab */}
                <div
                  className={`cursor-pointer p-4 flex items-center ${
                    activeTab === Tab.GENERAL_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => setActiveTab(Tab.GENERAL_TAB)}
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                  {t('general-tab')}
                </div>

                {/* Only show if isAdmin */}
                {isAdmin && (
                  <div
                    className={`cursor-pointer p-4 flex items-center ${
                      activeTab === Tab.STORAGE_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => setActiveTab(Tab.STORAGE_TAB)}
                  >
                    <CircleStackIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                    {t('storage-tab')}
                  </div>
                )}
                {isAdmin && (
                  <div
                    className={`cursor-pointer p-4 flex items-center ${
                      activeTab === Tab.WEBLINK_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => setActiveTab(Tab.WEBLINK_TAB)}
                  >
                    <LinkIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                    Weblink
                  </div>
                )}
                {isAdmin && (
                  <div
                    className={`cursor-pointer p-4 flex items-center ${
                      activeTab === Tab.PROMPT_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => setActiveTab(Tab.PROMPT_TAB)}
                  >
                    <PencilIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                    Prompt
                  </div>
                )}

                {/* Logout Button */}
                <div className="logout-button-container">
                  <button onClick={handleLogout} className="logout-button">
                    Logout
                  </button>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-4">
                {activeTab === Tab.GENERAL_TAB && <GeneralTab />}
                {isAdmin && activeTab === Tab.STORAGE_TAB && <StorageTab />}
                {isAdmin && activeTab === Tab.WEBLINK_TAB && <WeblinkTab />}
                {isAdmin && activeTab === Tab.PROMPT_TAB && <PromptTab />}
              </div>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};

export default UserSettingsModal;
