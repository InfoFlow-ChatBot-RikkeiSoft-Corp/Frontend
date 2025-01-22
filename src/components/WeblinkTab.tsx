import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { NotificationService } from '../service/NotificationService';
import { AuthService } from '../service/AuthService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

const WeblinkTab: React.FC = () => {
  const [weblink, setWeblink] = useState<string>('');
  const [weblinkList, setWeblinkList] = useState<Array<{ link: string; date: string }>>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadWeblinkList();
  }, []);

  const handleWeblinkUpload = async () => {
    const username = AuthService.getUsername(); // 사용자 이름 가져오기
    if (!username) {
      NotificationService.handleError("Username not found. Please log in again.");
      return;
    }
  
    // if (!weblink || !title) {
    //   NotificationService.handleError("Both title and weblink must be provided.");
    //   return;
    // }
  
    try {
      const queryUrl = `http://127.0.0.1:5000/api/files/upload?title=${encodeURIComponent(title)}&url=${encodeURIComponent(weblink)}`;
      console.log("Query URL:", queryUrl);
  
      const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username, // 사용자 이름 전달
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload Weblink.");
      }
  
      NotificationService.handleSuccess("Weblink uploaded successfully.");
      setWeblink('');
      loadWeblinkList();
    } catch (error) {
      // console.error("Error uploading weblink:", error.message);
      NotificationService.handleUnexpectedError(new Error("Failed to upload Weblink"));
    }
  };
  

  const loadWeblinkList = async () => {
    const username = AuthService.getUsername();
    if (!username) {
      NotificationService.handleError("Username not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.LIST_FILES}?is_url=true`, {
        method: "GET",
        headers: {
          username,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Weblink list.");
      }

      const data = await response.json();
      const weblinks = (data.files || [])
        .filter((item: any) => item.type === 'weblink')
        .map((weblink: any) => ({
          link: weblink.url,
          date: weblink.upload_date,
        }));

      setWeblinkList(weblinks);
    } catch (error) {
      NotificationService.handleUnexpectedError(new Error("Failed to load Weblink list"));
    }
  };

  const handleWeblinkDelete = async (link: string) => {
    const username = AuthService.getUsername();
    if (!username) {
      NotificationService.handleError("Username not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_FILE}/${encodeURIComponent(link)}`, {
        method: "DELETE",
        headers: {
          username,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete Weblink.");
      }

      NotificationService.handleSuccess(`Weblink "${link}" deleted successfully.`);
      loadWeblinkList();
    } catch (error) {
      NotificationService.handleUnexpectedError(new Error("Failed to delete Weblink"));
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <input
          type="text"
          value={weblink}
          onChange={(e) => setWeblink(e.target.value)}
          placeholder="Enter weblink"
          className="border border-gray-300 rounded p-2 flex-grow text-black"
        />
        <button
          onClick={handleWeblinkUpload}
          className="upload-button"
        >
          Upload
        </button>
      </div>
      <div className="table-container w-full h-full border-gray-300 rounded-lg">
        <table className="table-auto w-full h-full">
          <thead>
            <tr>
              <th>Weblink</th>
              <th>Upload Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {weblinkList.length > 0 ? (
              weblinkList.map((link, index) => (
                <tr key={index}>
                  <td title={link.link}>
                    <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {link.link}
                    </a>
                  </td>
                  <td>{new Date(link.date).toLocaleString()}</td>
                  <td className="py-2 px-4 text-sm text-gray-900 dark:text-white w-1/4 truncate">
                    <button
                      onClick={() => handleWeblinkDelete(link.link)}
                      className="py-1 px-2 bg-red-500 text-white rounded hover:bg-red-700"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="centered-text">
                  No weblinks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeblinkTab;