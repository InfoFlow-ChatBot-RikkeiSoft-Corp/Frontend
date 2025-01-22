import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { NotificationService } from '../service/NotificationService';
import { AuthService } from '../service/AuthService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const StorageTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<Array<{ name: string; type: string; size: number; date: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const acceptedFileExtensions = ["txt", "pdf", "doc", "docx"].map(ext => `.${ext}`).join(',');

  useEffect(() => {
    loadFileList();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
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

      NotificationService.handleSuccess("File uploaded successfully.");
      loadFileList();
      setSelectedFile(null);
    } catch (error) {
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
      const response = await fetch(`${API_ENDPOINTS.LIST_FILES}?is_url=false`, {
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
      const files = (data.files || [])
        .filter((item: any) => item.type === 'file')
        .map((file: any) => ({
          name: file.title,
          type: file.file_type,
          size: file.size,
          date: file.upload_date,
        }));

      setFileList(files);
    } catch (error) {
      NotificationService.handleUnexpectedError(new Error("Failed to load document list"));
    }
  };

  const handleFileDelete = async (name: string) => {
    if (!name) {
      NotificationService.handleError("Failed to delete file: Invalid file name.");
      return;
    }

    try {
      const username = AuthService.getUsername();
      if (!username) {
        NotificationService.handleError("Username not found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.DELETE_FILE}/${encodeURIComponent(name)}`, {
        method: "DELETE",
        headers: {
          username,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file.");
      }

      NotificationService.handleSuccess(`File "${name}" deleted successfully.`);
      loadFileList();
    } catch (error) {
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
  };

  const getFileExtension = (fileName: string) => {
    return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  return (
    <div className="container bg-white p-4 rounded-lg shadow-md">
      <div
        className="file-upload-box"
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
              <p className="file-size">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
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
            <p className="text-lg font-semibold" style={{ color: '#333333' }}>Drag and Drop</p>
            <p className="text-lg font-semibold" style={{ color: '#333333' }}>or</p>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            input?.click();
          }}
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
      <div className="save-button-box mt-4 text-center">
        <button
          onClick={handleFileUpload}
          disabled={!selectedFile}
          className="save-button-box button"
        >
          Upload
        </button>
      </div>
      <div className="table-container">
        <table className="table-auto">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Upload date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fileList.length > 0 ? (
              fileList.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.type}</td>
                  <td>{(file.size / 1024).toFixed(2)} KB</td>
                  <td>{new Date(file.date).toLocaleString()}</td>
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
                <td colSpan={5} className="py-2 px-4 text-sm text-gray-900 dark:text-white text-center">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorageTab;