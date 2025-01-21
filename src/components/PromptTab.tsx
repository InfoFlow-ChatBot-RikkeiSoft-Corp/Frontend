import React, { useState, useEffect } from 'react';
import { AuthService } from '../service/AuthService'; // Adjust the import according to your project structure
import { ChatBubbleLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import '../styles/PromptTab.css';

interface Prompt {
  id: number;
  name: string;
  text: string;
  created_by: string;
}

const PromptTab: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    // Fetch all prompts
    AuthService.getAllPrompts()
      .then(response => setPrompts(response))
      .catch(error => console.error('Error fetching prompts:', error));
  }, []);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptText(prompt.text);
  };

  const handleEditPrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const handleSavePrompt = () => {
    if (selectedPrompt) {
      AuthService.updatePrompt(selectedPrompt.id, { prompt_text: promptText, updated_by: AuthService.getUsername() || 'unknown' })
        .then(response => {
          console.log('Prompt updated successfully');
        })
        .catch(error => console.error('Error updating prompt:', error));
    }
  };

  const handleNewPrompt = () => {
    const newPrompt: Prompt = { id: Date.now(), name: 'New Prompt', text: '', created_by: AuthService.getUsername() || 'unknown' };
    setPrompts([...prompts, newPrompt]);
    setSelectedPrompt(newPrompt);
    setPromptText('');
  };

  const handleDeletePrompt = (id: number) => {
    setPrompts(prompts.filter(prompt => prompt.id !== id));
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(null);
      setPromptText('');
    }
  };

  const editPromptName = (prompt: Prompt) => {
    const newName = prompt.name + ' (edited)';
    const updatedPrompt: Prompt = { ...prompt, name: newName };
    setPrompts(prompts.map(p => p.id === prompt.id ? updatedPrompt : p));
  };

  return (
    <div className="prompt-tab-container">
      {/* Sidebar */}
      <div className="prompt-sidebar">
        <div className="scrollbar-trigger">
          <h2 className="sr-only">Prompt List</h2>
          <button className="new-prompt-button" onClick={handleNewPrompt}>
            <PlusIcon className="h-4 w-4" />
            New Prompt
          </button>
          <nav aria-label="Prompt List">
            {prompts.map((prompt: Prompt) => (
              <div
                key={prompt.id}
                className={`prompt-item ${selectedPrompt?.id === prompt.id ? 'selected' : ''}`}
                onClick={() => handlePromptClick(prompt)}
              >
                <ChatBubbleLeftIcon className="h-4 w-4" />
                <div className="prompt-name">{prompt.name}</div>
                <div className="button-group">
                  <button className="edit-button" onClick={() => editPromptName(prompt)}>
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button className="delete-button" onClick={() => handleDeletePrompt(prompt.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Page */}
      <div className="prompt-main">
        <textarea
          className="prompt-textarea"
          value={selectedPrompt ? promptText : 'Please enter a prompt for chatbot.'}
          onChange={handleEditPrompt}
        />
        <div className="prompt-footer">
          <button
            className="edit-prompt-button"
            onClick={() => {
              setSelectedPrompt(null);
              setPromptText('');
            }}
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>
          <button
            className="save-prompt-button"
            onClick={handleSavePrompt}
          >
            <PlusIcon className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
  
  export default PromptTab;