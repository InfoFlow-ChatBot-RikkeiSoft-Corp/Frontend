import React, {useContext, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import ConversationService, {
  Conversation,
  ConversationChangeEvent,
  conversationsEmitter
} from "../service/ConversationService";
import {iconProps} from "../svg";
import {useTranslation} from "react-i18next";
import {UserContext} from "../UserContext";
import ConversationListItem from './ConversationListItem';

function useCurrentPath() {
  return useLocation().pathname;
}

const ConversationList: React.FC = () => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const currentPath = useCurrentPath();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [conversationsWithMarkers, setConversationsWithMarkers] = useState<Conversation[]>([]);
  const { userSettings } = useContext(UserContext);

  useEffect(() => {
    loadConversations();
    // If you want to handle real-time changes:
    conversationsEmitter.on('conversationChangeEvent', handleConversationChange);
    return () => {
      conversationsEmitter.off('conversationChangeEvent', handleConversationChange);
    };
  }, []);

  useEffect(() => {
    // If user navigates to /c/<id>, set that as selected
    const itemId = currentPath.split('/c/')[1];
    if (itemId) {
      let n = Number(itemId);
      ConversationService.getConversationById(n).then((conversation) => {
        if (conversation) {
          setSelectedId(conversation.id);
        } else {
          console.error("Conversation not found.");
        }
      });
    } else {
      setSelectedId(null);
    }
  }, [currentPath]);

  useEffect(() => {
    const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);
    setConversationsWithMarkers(insertTimeMarkers(sortedConversations));
  }, [conversations]);

  const insertTimeMarkers = (list: Conversation[]) => {
    let lastHeader = "";
    const withMarkers: Conversation[] = [];
    list.forEach((convo, index) => {
      const currentHeader = getHeaderFromTimestamp(convo.timestamp);
      if (currentHeader !== lastHeader) {
        // marker
        withMarkers.push({
          id: 0,
          title: currentHeader,
          timestamp: 0,
          marker: true
        } as Conversation);
        lastHeader = currentHeader;
      }
      withMarkers.push(convo);
    });
    return withMarkers;
  };

  const getHeaderFromTimestamp = (ts: number) => {
    const today = new Date();
    const date = new Date(ts); // if ts is in ms, ensure that
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('today');
    if (diffDays === 2) return t('yesterday');
    if (diffDays <= 7)  return t('previous-7-days');
    if (diffDays <= 30) return t('previous-30-days');

    return date.toLocaleString(navigator.language, { month: 'long' });
  };

  const loadConversations = async () => {
    try {
      const convs = await ConversationService.loadRecentConversationsTitleOnly();
      setConversations(convs);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleConversationChange = (event: ConversationChangeEvent) => {
    if (event.action === 'add' && event.conversation) {
      setSelectedId(event.conversation.id);
      setConversations(prev => [event.conversation!, ...prev]);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else if (event.action === 'edit' && event.id) {
      setConversations(prev =>
        prev.map(c => c.id === event.id ? (event.conversation || c) : c)
      );
    } else if (event.action === 'delete' && event.id) {
      setConversations(prev => prev.filter(c => c.id !== event.id));
    }
  };

  const handleSearch = async (searchString: string) => {
    if (!searchString.trim()) {
      loadConversations();
      return;
    }
    searchString = searchString.trim();
    if (searchString.toLowerCase().startsWith('in:convo')) {
      const actualSearchString = searchString.substring('in:convo'.length).trim();
      if (!actualSearchString) {
        setConversations([]);
        return;
      }
      try {
        const found = await ConversationService.searchWithinConversations(actualSearchString);
        setConversations(found);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Title search
      try {
        const found = await ConversationService.searchConversationsByTitle(searchString);
        // Overwrite messages with [] if you want
        const modified = found.map(c => ({ ...c, messages: "[]" }));
        setConversations(modified);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const ConversationListItemMemo = React.memo(ConversationListItem);

  return (
    <div className="conversation-list-container">
      {/* Search Bar */}
      <div id="conversation-search" className="flex flex-row items-center mb-2 relative">
        <input
          id="searchInput"
          className="flex-grow rounded-md border dark:text-gray-100 dark:bg-gray-850 dark:border-white/20 px-2 py-1"
          type="text"
          autoComplete="off"
          placeholder={t('search')}
          value={searchInputValue}
          onFocus={() => setShowSearchOptions(true)}
          onBlur={() => setTimeout(() => setShowSearchOptions(false), 200)}
          onChange={(e) => setSearchInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchInputValue);
              setShowSearchOptions(false);
            }
          }}
        />
        <button
          className="ml-2 rounded-md border dark:border-white/20 p-1"
          onClick={() => {
            handleSearch(searchInputValue);
            setShowSearchOptions(false);
          }}
        >
          <MagnifyingGlassIcon
            style={{ color: userSettings?.theme === 'dark' ? '#FFFFFF' : '#000000' }}
            {...iconProps}
          />
        </button>
      </div>

      {/* Conversation List */}
      <div
        id="conversation-list"
        ref={scrollContainerRef}
        className="flex-col flex-1 transition-opacity duration-500 -mr-2 pr-2 overflow-y-auto"
      >
        <div className="flex flex-col gap-2 pb-2 dark:text-gray-100 text-gray-800 text-sm">
          <div className="relative overflow-x-hidden" style={{height: "auto", opacity: 1}}>
            <ol>
              {conversationsWithMarkers.map((convo, index) => {
                if (convo.marker) {
                  // Render time marker header
                  return (
                    <li key={`marker-${index}`} className="sticky top-0 z-[16]">
                      <h3 className="h-9 pb-2 pt-3 px-3 text-xs text-gray-500 font-medium bg-gray-50 dark:bg-gray-900">
                        {convo.title}
                      </h3>
                    </li>
                  );
                } else {
                  // Normal conversation item
                  return (
                    <ConversationListItemMemo
                      key={convo.id}
                      convo={convo}
                      isSelected={selectedId === convo.id}
                      loadConversations={loadConversations}
                      setSelectedId={setSelectedId}
                    />
                  );
                }
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
