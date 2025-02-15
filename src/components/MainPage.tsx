import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatService } from "../service/ChatService";
import { AuthService } from "../service/AuthService";
import Chat from "./Chat";
import { ChatCompletion, ChatMessage, MessageType, Role, FileDataRef } from "../models/ChatCompletion";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { OPENAI_DEFAULT_SYSTEM_PROMPT } from "../config";
import { CustomError } from "../service/CustomError";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom/client';
import MessageBox, { MessageBoxHandles } from "./MessageBox";
import {
  CONVERSATION_NOT_FOUND,
  DEFAULT_INSTRUCTIONS,
  DEFAULT_MODEL,
  MAX_TITLE_LENGTH,
  SNIPPET_MARKERS
} from "../constants/appConstants";
import ConversationService, { Conversation } from '../service/ConversationService';
import { UserContext } from '../UserContext';
import { NotificationService } from '../service/NotificationService';
import { ArrowUturnDownIcon } from '@heroicons/react/24/outline';
import { NewConversationService } from '../service/NewConversationService';

function getFirstValidString(...args: (string | undefined | null)[]): string {
  for (const arg of args) {
    if (arg !== null && arg !== undefined && arg.trim() !== '') {
      return arg;
    }
  }
  return '';
}

interface MainPageProps {
  className: string;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ className, isSidebarCollapsed, toggleSidebarCollapse }) => {
  const { userSettings } = useContext(UserContext);
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [allowAutoScroll, setAllowAutoScroll] = useState(true);
  const messageBoxRef = useRef<MessageBoxHandles>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const button = createButton();
    buttonRef.current = button;

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    console.log("Loaded ID:", id);
    if (location.pathname === '/') {
      newConversation();
    } else {
      if (id) {
        handleSelectedConversation(id);
      } else {
        newConversation();
      }
    }
  }, [id, location.pathname]);

  useEffect(() => {
    if (location.state?.reset) {
      messageBoxRef.current?.reset();
      messageBoxRef.current?.focusTextarea();
    }
  }, [location.state]);

  useEffect(() => {
    if (messages.length === 0) {
      setConversation(null);
    }
    if (conversation && conversation.id) {
      // Only update if there are messages
      if (messages.length > 0) {
        ConversationService.updateConversation(conversation, messages);
      }
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // ChatService.cancelStream();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const newConversation = () => {
    setConversation(null);
    setShowScrollButton(false);
    clearInputArea();
    setMessages([]);
    messageBoxRef.current?.focusTextarea();
  }

  const handleSelectedConversation = (id: string | null) => {
    if (id && id.length > 0) {
      let n = Number(id);
      ConversationService.getConversationById(n)
        .then(conversation => {
          if (conversation) {
            setConversation(conversation);
            clearInputArea();
            ConversationService.getChatMessages(conversation).then((messages: ChatMessage[]) => {
              if (messages.length === 0) {
                // Race condition: the navigate to /c/id and the updating of the messages state
                // are happening at the same time.
                console.warn('possible state problem');
              } else {
                setMessages(messages);
              }
            })
          } else {
            const errorMessage: string = 'Conversation ' + location.pathname + ' not found';
            NotificationService.handleError(errorMessage, CONVERSATION_NOT_FOUND);
            navigate('/');
          }
        });
    } else {
      newConversation();
    }
    setAllowAutoScroll(true);
    setShowScrollButton(false)
    messageBoxRef.current?.focusTextarea();
  }

  function getTitle(message: string): string {
    let title = message.trimStart(); // Remove leading newlines
    let firstNewLineIndex = title.indexOf('\n');
    if (firstNewLineIndex === -1) {
      firstNewLineIndex = title.length;
    }
    return title.substring(0, Math.min(firstNewLineIndex, MAX_TITLE_LENGTH));
  }

  function startConversation(message: string, fileDataRef: FileDataRef[]) {
    const id = Date.now();
    const timestamp = Date.now();
    let shortenedText = getTitle(message);
    let instructions = getFirstValidString(userSettings.instructions, OPENAI_DEFAULT_SYSTEM_PROMPT, DEFAULT_INSTRUCTIONS);
    const conversation: Conversation = {
      id: id,
      gid: 0,
      timestamp: timestamp,
      title: shortenedText,
      model: DEFAULT_MODEL,
      systemPrompt: instructions,
      messages: "[]",
    };
    setConversation(conversation);
    ConversationService.addConversation(conversation);
    navigate(`/c/${conversation.id}`);
  }

  const callApp = (message: string, fileDataRef: FileDataRef[]) => {
    if (!conversation) {
      startConversation(message, fileDataRef);
    }
    setAllowAutoScroll(true);
    addMessage(Role.User, MessageType.Normal, message, fileDataRef, sendMessage);
  }

  const addMessage = (
    role: Role, 
    messageType: MessageType, 
    message: string, 
    fileDataRef: FileDataRef[], 
    callback?: (callback: ChatMessage[]) => void
  ) => {
    setMessages((prevMessages: ChatMessage[]) => {
      const newMessage: ChatMessage = {
        id: prevMessages.length + 1,
        role: role,
        messageType: messageType,
        content: message,
        fileDataRef: fileDataRef,
      };
      const updatedMessages = [...prevMessages, newMessage]; // 이전 메시지에 새 메시지 추가
      if (callback) {
        callback(updatedMessages);
      }
      return updatedMessages;
    });
  };

  function sendMessage(updatedMessages: ChatMessage[]) {
    setLoading(true);
    clearInputArea();

    // 시스템 프롬프트 설정
    let systemPrompt = getFirstValidString(
      conversation?.systemPrompt,
      userSettings.instructions,
      OPENAI_DEFAULT_SYSTEM_PROMPT,
      DEFAULT_INSTRUCTIONS
    );
  
    // 메시지 리스트 생성
    let messages: ChatMessage[] = [
      {
        role: Role.System,
        content: systemPrompt,
      } as ChatMessage,
      ...updatedMessages,
    ];
    
    // 사용자 메시지 추가 (마지막 메시지만) // Error of double message
    // const userMessage = updatedMessages[updatedMessages.length - 1];
    // if (userMessage) {
    //   addMessage(userMessage.role, userMessage.messageType, userMessage.content, []); // 실제 유저 메시지
    // }
    
    // RAG 모델로 메시지 스트리밍 전송
    const user_id = AuthService.getId(); // localStorage에서 user_id 가져오기
    const conversation_id = NewConversationService.getConversationId();
    if(user_id && conversation_id){
      console.log(user_id)
      ChatService.sendMessageStreamed(user_id, conversation_id, messages, handleStreamedResponse)
      .catch((err) => {
        if (err instanceof CustomError) {
          const message: string = err.message;
          setLoading(false);
          addMessage(Role.Assistant, MessageType.Error, message, []);
        } else {
          NotificationService.handleUnexpectedError(
            err,
            "Failed to send message to RAG model."
          );
        }
      })
      .finally(() => {
        setLoading(false); // 로딩 상태 종료
      });
    } else {
      console.error("User ID not found. Please log in.");
      setLoading(false);
    }    
  }
  
  const handleStreamedResponse = (response: string) => {
    try {
      const parsedResponse = JSON.parse(response); // JSON 파싱
      const answer = parsedResponse?.answer || ""; // answer 필드만 가져오기
  
      setMessages((prevMessages: ChatMessage[]) => {
        const updatedMessages = [...prevMessages];
  
        // 마지막 메시지를 가져옴
        const lastMessageIndex = updatedMessages.length - 1;
        const lastMessage = updatedMessages[lastMessageIndex];
  
        if (lastMessage && lastMessage.role === Role.Assistant) {
          // 기존 Assistant 메시지가 있다면 응답 내용을 추가
          updatedMessages[lastMessageIndex] = {
            ...lastMessage,
            content: lastMessage.content + answer, // 기존 내용에 answer 추가
          };
        } else {
          // Assistant 메시지가 없으면 새 메시지 추가
          updatedMessages.push({
            id: updatedMessages.length + 1,
            role: Role.Assistant,
            messageType: MessageType.Normal,
            content: answer, // answer 필드만 추가
            fileDataRef: [],
          });
        }
  
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error parsing response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          role: Role.Assistant,
          messageType: MessageType.Error,
          content: "Invalid response format.",
          fileDataRef: [],
        },
      ]);
    }
  };

  const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scroll({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const clearInputArea = () => {
    messageBoxRef.current?.clearInputValue();
  };

  const handleUserScroll = (isAtBottom: boolean) => {
    setAllowAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  const createButton = () => {
    const button = document.createElement('button');
    button.className = 'px-2 py-1 bg-gray-100 text-black dark:text-black dark:bg-gray-200 border border-gray-200 dark:border-gray-800 rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-100 focus:outline-none';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'h-5 w-5';

    const root = ReactDOM.createRoot(iconContainer);
    root.render(<ArrowUturnDownIcon />);

    button.appendChild(iconContainer);
    // Stop propagation for mousedown and mouseup to avoid affecting other event listeners
    button.addEventListener('mousedown', event => event.stopPropagation());
    button.addEventListener('mouseup', event => event.stopPropagation());
    button.addEventListener('click', handleQuoteSelectedText);
    return button;
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() === '') {
      if (buttonRef.current && buttonRef.current.parentNode) {
        buttonRef.current.parentNode.removeChild(buttonRef.current);
        buttonRef.current = null;
      }
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Remove the existing button if it exists
      if (buttonRef.current && buttonRef.current.parentNode) {
        buttonRef.current.parentNode.removeChild(buttonRef.current);
      }

      const newButton = createButton();
      const buttonHeight = 30; // Approximate height of the button
      const buttonWidth = newButton.offsetWidth;

      const chatContainer = document.getElementById('chat-container1');
      if (chatContainer) {
        const containerRect = chatContainer.getBoundingClientRect();

        newButton.style.position = 'absolute';
        newButton.style.left = `${rect.left - containerRect.left + (rect.width / 2) - (buttonWidth / 2)}px`; // Center horizontally relative to container
        newButton.style.top = `${rect.top - containerRect.top - buttonHeight}px`; // Position above the selection relative to container
        newButton.style.display = 'inline-block';
        newButton.style.verticalAlign = 'middle';
        newButton.style.zIndex = '1000';

        chatContainer.appendChild(newButton);

        buttonRef.current = newButton;
      }
    }
  };

  const handleQuoteSelectedText = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      const modifiedText = `Assistant wrote:\n${SNIPPET_MARKERS.begin}\n${selectedText}\n${SNIPPET_MARKERS.end}\n`;
      messageBoxRef.current?.pasteText(modifiedText);
      messageBoxRef.current?.focusTextarea();
    }
  };

  return (
    <div className={`${className} overflow-hidden w-full h-full relative flex z-0 dark:bg-gray-900`}>
      <div className="flex flex-col items-stretch w-full h-full">
        <main
          className="relative h-full transition-width flex flex-col overflow-hidden items-stretch flex-1"
          onMouseUp={handleMouseUp}>
          <Chat chatBlocks={messages} onChatScroll={handleUserScroll} conversation={conversation}
            model={DEFAULT_MODEL}
            allowAutoScroll={allowAutoScroll} loading={loading} />
          {/* Absolute container for the ScrollToBottomButton */}
          {showScrollButton && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-10 z-10">
              <ScrollToBottomButton onClick={scrollToBottom} />
            </div>
          )}
          {/* MessageBox remains at the bottom */}
          <MessageBox
            ref={messageBoxRef}
            callApp={callApp}
            loading={loading}
            setLoading={setLoading}
            allowImageAttachment={true}
          />
        </main>
      </div>
    </div>
  );
}

export default MainPage;