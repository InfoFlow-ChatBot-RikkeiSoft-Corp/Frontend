import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  CircleStackIcon,
  Cog6ToothIcon,
  XMarkIcon,
  TrashIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { PencilIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { Theme, UserContext } from '../UserContext';
import '../styles/UserSettingsModal.css';
import { NotificationService } from '../service/NotificationService';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tabs,
  TabsHeader,
  Avatar,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

enum Tab {
  GENERAL_TAB = 'General',
  STORAGE_TAB = 'Storage',
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isVisible, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { userSettings, setUserSettings } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL_TAB);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<Array<{ name: string; type: string; size: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      setActiveTab(Tab.GENERAL_TAB);
      loadFileList();
    }
  }, [isVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      try {
        const fileData = await selectedFile.arrayBuffer();
        const fileInfo = {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: Array.from(new Uint8Array(fileData)),
        };
        localStorage.setItem(`uploadedFile_${selectedFile.name}`, JSON.stringify(fileInfo));
        NotificationService.handleSuccess('File uploaded successfully.');
        setSelectedFile(null);
        loadFileList();
      } catch (error) {
        console.error('Failed to upload file:', error);
        NotificationService.handleUnexpectedError(new Error('Failed to upload file'));
      }
    }
  };

  const loadFileList = () => {
    const files: Array<{ name: string; type: string; size: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('uploadedFile_')) {
        try {
          const fileInfo = JSON.parse(localStorage.getItem(key) || '{}');
          if (fileInfo.name && fileInfo.type && fileInfo.size) {
            files.push({
              name: fileInfo.name,
              type: fileInfo.type,
              size: fileInfo.size,
            });
          } else {
            console.warn(`Invalid file info for key: ${key}`);
          }
        } catch (error) {
          console.error(`Failed to parse file info for key: ${key}`, error);
        }
      }
    }
    setFileList(files);
  };

  const handleFileDelete = (fileName: string) => {
    localStorage.removeItem(`uploadedFile_${fileName}`);
    NotificationService.handleSuccess('File deleted successfully.');
    loadFileList();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('User logged out');
    navigate('/login'); // Redirect to the login page
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
            className="flex flex-col bg-white dark:bg-gray-850 rounded-lg w-full max-w-2xl mx-auto overflow-hidden"
            style={{ height: '90vh', width: '170vh' }}
          >
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
            <div id="user-settings-content" className="flex flex-1 overflow-auto relative">
              <div className="border-r border-gray-200 flex flex-col">
                <div
                  className={`cursor-pointer p-4 flex items-center ${
                    activeTab === Tab.GENERAL_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => setActiveTab(Tab.GENERAL_TAB)}
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                  {t('general-tab')}
                </div>
                <div
                  className={`cursor-pointer p-4 flex items-center ${
                    activeTab === Tab.STORAGE_TAB ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`}
                  onClick={() => setActiveTab(Tab.STORAGE_TAB)}
                >
                  <CircleStackIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                  {t('storage-tab')}
                </div>
                <div className="logout-button-container">
                  <button
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                {activeTab === Tab.GENERAL_TAB && (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="theme">{t('theme-label')}</label>
                      <select
                        id="theme"
                        name="theme"
                        className="custom-select dark:custom-select border-gray-300 border rounded p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        value={userSettings.userTheme}
                        onChange={(e) => {
                          setUserSettings({
                            ...userSettings,
                            userTheme: e.target.value as Theme,
                          });
                        }}
                      >
                        <option value="dark">{t('dark-option')}</option>
                        <option value="light">{t('light-option')}</option>
                        <option value="system">{t('system-option')}</option>
                      </select>
                    </div>
                  </div>
                )}
                {activeTab === Tab.STORAGE_TAB && (
                  <>
                    <div className="container bg-white p-4 rounded-lg shadow-md">
                      <div className="file-upload-box"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <img
                          src="/files-icon.png" // Replace this with your actual upload icon path
                          alt="Upload Icon"
                          className="w-24 h-24 mb-2"
                        />
                        <p className="text-lg font-semibold">Drag and Drop</p>
                        <p className="or-text">or</p>
                        <button
                          type="button"
                          onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                          className="file-upload-box button "
                        >
                          Upload Files
                        </button>
                        <input
                          type="file"
                          id="file-upload"
                          name="file-upload"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </div>
                      <div className="save-button-box mt-4 text-center">
                        <button
                          onClick={handleFileUpload}
                          disabled={!selectedFile}
                          className="save-button-box button"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4>Uploaded Files:</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fileList.length > 0 ? (
                            fileList.map((file, index) => (
                              <tr key={index}>
                                <td title={file.name}>{file.name}</td>
                                <td>{file.type}</td>
                                <td>{(file.size / 1024).toFixed(2)} KB</td>
                                <td className="py-2 px-4 text-sm text-gray-900 dark:text-white w-1/4 truncate">
                                  <button
                                    onClick={() => handleFileDelete(file.name)}
                                    className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-2 px-4 text-sm text-gray-900 dark:text-white text-center"
                              >
                                No files found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};

export default UserSettingsModal;