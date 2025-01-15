import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  CircleStackIcon,
  Cog6ToothIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Theme, UserContext } from '../UserContext';
import '../styles/UserSettingsModal.css';
import { NotificationService } from '../service/NotificationService';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { AuthService } from '../service/AuthService';

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
  const [fileList, setFileList] = useState<Array<{
    title: ReactI18NextChildren | Iterable<ReactI18NextChildren>; name: string; type: string; size: number 
}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const acceptedFileExtensions = ["txt", "pdf", "doc", "docx"].map(ext => `.${ext}`).join(',');

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
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFileUpload = async () => {

    const username = AuthService.getUsername();
    if (!username) {
      NotificationService.handleError("Username not found. Please log in again.");
      return;
    }

    if (!selectedFile) {
        NotificationService.handleError("No file selected.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
            method: "POST",
            body: formData,
            headers: {
                username,
            },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file.");
        }

        const data = await response.json();
        NotificationService.handleSuccess("File uploaded successfully.");
        console.log("Uploaded metadata:", data.metadata);

        // Refresh file list after upload
        loadFileList();
    } catch (error) {
        console.error("Error during file upload:", error);
        NotificationService.handleUnexpectedError(new Error("Failed to upload file"));
    }
  };


  const loadFileList = async () => {
    const username = AuthService.getUsername();
    if (!username) {
        NotificationService.handleError("Username not found. Please log in again.");
        return;
    }
    try {
        const response = await fetch(API_ENDPOINTS.LIST_FILES, {
            method: "GET",
            headers: {
                username,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch file list.");
        }

        const data = await response.json();

        console.log("Loaded file list from API:", data.files);
        setFileList(data.files || []);
    } catch (error) {
        console.error("Error loading file list:", error);
        NotificationService.handleUnexpectedError(new Error("Failed to load file list"));
    }
  };


  const handleFileDelete = async (title: string) => {
    try {
        const username = AuthService.getUsername();
        if (!username) {
            NotificationService.handleError("Username not found. Please log in again.");
            return;
        }

        const response = await fetch(`${API_ENDPOINTS.DELETE_FILE}/${encodeURIComponent(title)}`, {
            method: "DELETE",
            headers: {
                username,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete file.");
        }

        NotificationService.handleSuccess(`File "${title}" deleted successfully.`);
        loadFileList(); // 파일 목록 새로고침
    } catch (error) {
        console.error("Error deleting file:", error);
        NotificationService.handleUnexpectedError(new Error("Failed to delete file"));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('User logged out');
    navigate('/login'); // Redirect to the login page
  };

  const getFileExtension = (fileName: string) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
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
                      {selectedFile && (
                        <div className="file-preview">
                          <div className="file-icon">
                            <div className="circle">
                              <span className="icon-text">{getFileExtension(selectedFile.name)}</span>
                            </div>
                          </div>
                          <div className="file-info">
                            <p className="file-name">{selectedFile.name}</p>
                            <p className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                      )}
                      {!selectedFile && (
                        <>
                          <img
                            src="/files-icon.png"
                            alt="Upload Icon"
                            className="w-24 h-24 mb-2"
                          />
                          <p className="text-lg font-semibold">Drag and Drop</p>
                          <p className="or-text">or</p>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                        className="file-upload-box button"
                      >
                        Select File
                      </button>
                      <input
                        type="file"
                        id="file-upload"
                        name="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={acceptedFileExtensions}
                      />
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
                                    <td>{file.title}</td> {/* title을 사용 */}
                                    <td>{file.type}</td>
                                    <td>{(file.size / 1024).toFixed(2)} KB</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                console.log("Deleting file with title:", file.title); // title 확인
                                                handleFileDelete(file.title); // title 기반 삭제 요청
                                            }}
                                            className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center">No files found</td>
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