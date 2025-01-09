import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ChatSettingDropdownMenuProps {
  showTitle?: boolean;
  className?: string;
  alignRight?: boolean;
}

const ChatSettingDropdownMenu: React.FC<ChatSettingDropdownMenuProps> = ({
  showTitle = true,
  className,
  alignRight = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItemsClass = `absolute ${alignRight ? 'right-0' : 'left-0'} w-56 mt-2 origin-top-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-600 rounded-md shadow-lg outline-none z-20`;

  return (
    <Fragment>
      <div className={`inline-block relative text-left ${className}`} onClick={(event) => event.stopPropagation()}>
        <Menu as="div">
          {({ open }) => (
            <>
              <Menu.Button
                style={{ paddingTop: '.625rem', paddingBottom: '.625rem' }}
                className="inline-flex px-3 text-md font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none items-center">
                <span>{showTitle ? 'Menu' : ''}</span>
                <ChevronDownIcon className={`${open ? 'transform rotate-180' : ''} w-5 h-5`} aria-hidden="true" />
              </Menu.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0">
                <Menu.Items className={menuItemsClass}>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate(`/g/`, { state: { reset: Date.now() } })}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                            active ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          <PencilSquareIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                          {t('new-chat')}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </Fragment>
  );
};

export default ChatSettingDropdownMenu;