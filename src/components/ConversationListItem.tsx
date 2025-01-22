import React, {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ChatBubbleLeftIcon, CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon} from "@heroicons/react/24/outline";
import ConversationService, {Conversation} from "../service/ConversationService";
import {iconProps} from "../svg";
import {MAX_TITLE_LENGTH} from "../constants/appConstants";

interface ConversationListItemProps {
  convo: Conversation;
  isSelected: boolean;
  loadConversations: () => void;
  setSelectedId: (id: number) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  convo,
  isSelected,
  loadConversations,
  setSelectedId
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(convo.title);
  const navigate = useNavigate();
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);

  const saveEditedTitle = () => {
    ConversationService.updateConversationPartial(convo, {title: editedTitle})
      .then(() => {
        setIsEditingTitle(false);
        loadConversations();
      })
      .catch((error) => {
        console.error('Error updating conversation title:', error);
      });
  };

  const deleteConversation = () => {
    ConversationService.deleteConversation(convo.id)
      .then(() => {
        loadConversations();
        navigate('/main');
      })
      .catch((error) => {
        console.error('Error deleting conversation:', error);
      });
  };

  const selectConversation = () => {
    setSelectedId(convo.id);
    if (!isEditingTitle) {
      const url = convo.gid ? `/g/${convo.gid}/c/${convo.id}` : `/c/${convo.id}`;
      navigate(url);
    }
  };

  const toggleEditMode = () => {
    if (!isEditingTitle) {
      // Entering edit mode
      setEditedTitle(convo.title);
    } else {
      // Exiting edit mode
      setEditedTitle('');
    }
    setIsEditingTitle(!isEditingTitle);
  };

  const handleTitleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEditedTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(convo.title);
    }
  };

  const handleInputBlur = () => {
    // Decide if you want to auto-save on blur or revert
    // For now, let's revert the changes if user clicks away
    setIsEditingTitle(true);
    setEditedTitle(convo.title);
  };

  // Render: selected = different styling
  if (isSelected) {
    return (
      <li key={convo.id} className="relative z-[15]" style={{opacity: 1, height: "auto"}}>
        <div
          role="button"
          className="relative flex py-3 px-3 items-center gap-3 rounded-md bg-gray-100 dark:bg-gray-800 cursor-pointer break-all pr-14 group"
        >
          {!isEditingTitle && <ChatBubbleLeftIcon {...iconProps} />}
          {isEditingTitle ? (
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="dark:bg-gray-800 dark:text-gray-100 text-center"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleInputKeyPress}
                autoFocus
                maxLength={MAX_TITLE_LENGTH}
                style={{width: "12.4em"}}
                onBlur={handleInputBlur}
              />
            </div>
          ) : (
            <div className="relative flex-1 w-full text-left overflow-hidden whitespace-nowrap overflow-ellipsis max-h-5 break-all">
              {convo.title}
            </div>
          )}
          <div className="absolute flex right-1 z-10 dark:text-gray-300 text-gray-800 text-center">
            {isEditingTitle ? (
              <>
                <button
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditedTitle(convo.title);
                  }}
                  className="p-1 hover:text-gray-400 dark:hover:text-white"
                >
                  <XMarkIcon {...iconProps} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleEditMode}
                  className="p-1 hover:text-gray-400 dark:hover:text-white"
                >
                  <PencilSquareIcon {...iconProps} />
                </button>
                <button
                  onClick={deleteConversation}
                  className="p-1 hover:text-gray-400 dark:hover:text-white"
                >
                  <TrashIcon {...iconProps} />
                </button>
              </>
            )}
          </div>
        </div>
      </li>
    );
  } else {
    return (
      <li key={convo.id} className="relative z-[15]" style={{opacity: 1, height: "auto"}}>
        <button
          onClick={selectConversation}
          type="button"
          className="relative flex w-full py-3 px-3 items-center gap-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-850 rounded-md cursor-pointer break-all"
        >
          <ChatBubbleLeftIcon {...iconProps} />
          <div className="relative flex-1 overflow-hidden text-left whitespace-nowrap overflow-ellipsis max-h-5 break-all">
            {convo.title}
          </div>
        </button>
      </li>
    );
  }
};

export default ConversationListItem;
