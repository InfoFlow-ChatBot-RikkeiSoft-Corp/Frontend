import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Cog8ToothIcon, PlusIcon} from "@heroicons/react/24/outline";
import {CloseSideBarIcon, iconProps, OpenSideBarIcon} from "../svg";
import {useTranslation} from 'react-i18next';
import Tooltip from "./Tooltip";
import UserSettingsModal from './UserSettingsModal';
import ConversationList from "./ConversationList";
import { AuthService } from '../service/AuthService';
import { NotificationService } from '../service/NotificationService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

interface SidebarProps {
  className: string;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({className, isSidebarCollapsed, toggleSidebarCollapse}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  const openSettingsDialog = () => {
    setSettingsModalVisible(true);
  }

  const handleNewChat = async () => {
    // 사용자 이름 동적 확인
    const username = AuthService.getUsername();
    console.log("AuthService.getUsername():", username);
    if (!username) {
      NotificationService.handleError("Username not found. Please log in again.");
      return;
    }
  
    try {
      // API 호출
      const response = await fetch(API_ENDPOINTS.NEW_CONVERSATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username, // 동적으로 사용자 이름 추가
        },
        body: JSON.stringify({
          title: "New Conversation", // 기본 채팅 제목
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start a new conversation.");
      }
  
      // 성공적으로 채팅 생성
      const data = await response.json();
      NotificationService.handleSuccess("New conversation started successfully.");
      console.log("Created conversation ID:", data.conversation_id);
  
      // 새 채팅 화면으로 이동
      navigate(`/c/${data.conversation_id}`);
    } catch (error) {
      // error를 명시적으로 처리
      if (error instanceof Error) {
        console.error("Error starting new conversation:", error.message);
        NotificationService.handleError(
          error.message || "An error occurred while starting a new conversation."
        );
      } else {
        console.error("Unexpected error:", error);
        NotificationService.handleError("An unexpected error occurred.");
      }
    }
  }
  

  const handleOnClose = () => {
    setSettingsModalVisible(false);
  }

  return (
    <div className={`${className} ${isSidebarCollapsed ? 'w-0' : 'w-auto'}`}>
      {isSidebarCollapsed && (
        <div className="absolute top-0 left-0 z-50">
          <Tooltip title={t('open-sidebar')} side="right" sideOffset={10}>
            <button
              className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-white
              cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-300 dark:hover:bg-gray-600
              h-11 w-11 flex-shrink-0 items-center justify-center bg-white dark:bg-transparent"
              onClick={toggleSidebarCollapse}>
              <OpenSideBarIcon/>
            </button>
          </Tooltip>
        </div>
      )}
      <UserSettingsModal
        isVisible={isSettingsModalVisible}
        onClose={handleOnClose}
      />
      {/* sidebar is always dark mode*/}
      <div
        className="sidebar duration-500 transition-all h-full flex-shrink-0 overflow-x-hidden dark:bg-gray-900">
        <div className="h-full w-[260px]">
          <div className="flex h-full min-h-0 flex-col ">
            <div className="scrollbar-trigger relative h-full flex-1 items-start border-white/20">
              <h2 className="sr-only">Chat history</h2>
              <nav className="flex h-full flex-col p-2" aria-label="Chat history">
                <div className="mb-1 flex flex-row gap-2">
                  <button className="flex px-3 min-h-[44px] py-1 items-center gap-3
                       transition-colors duration-200 dark:text-white
                       cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10 h-11
                       bg-white dark:bg-transparent flex-grow overflow-hidden"
                          onClick={handleNewChat}
                          type="button"
                  >
                    <PlusIcon {...iconProps} />
                    <span className="truncate">{t('new-chat')}</span>
                  </button>
                  <Tooltip title={t('open-settings')} side="right" sideOffset={10}>
                    <button
                      type="button"
                      className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-white
                      cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10 h-11 w-11
                      flex-shrink-0 items-center justify-center bg-white dark:bg-transparent"
                      onClick={openSettingsDialog}>
                      <Cog8ToothIcon/>
                    </button>
                  </Tooltip>
                  <Tooltip title={t('close-sidebar')} side="right" sideOffset={10}>
                    <button
                      className="flex px-3 min-h-[44px] py-1 gap-3 transition-colors duration-200 dark:text-white
                      cursor-pointer text-sm rounded-md border dark:border-white/20 hover:bg-gray-500/10
                      h-11 w-11 flex-shrink-0 items-center justify-center bg-white dark:bg-transparent"
                      onClick={toggleSidebarCollapse}
                      type="button"
                    >
                      <CloseSideBarIcon/>
                    </button>
                  </Tooltip>
                </div>
                <ConversationList/>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;