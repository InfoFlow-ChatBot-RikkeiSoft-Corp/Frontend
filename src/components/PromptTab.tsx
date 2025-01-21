import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import PromptService from '../service/PromptService';
import '../styles/PromptTab.css';

interface Prompt {
  id: number;
  name: string;
  text: string;
  is_active: boolean;
}

const PromptTab: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    // Fetch all prompts
    PromptService.getAllPrompts()
      .then(response => setPrompts(response))
      .catch(error => console.error('Error fetching prompts:', error));
  }, []);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptText(prompt.text);
  };

  const handleEditPrompt = () => {
  }

  const handleSavePrompt = () => {
    if (selectedPrompt) {
      PromptService.updatePrompt(selectedPrompt.id, { prompt_text: promptText, updated_by: 'current_user' }) // Replace 'current_user' with actual user
        .then(response => {
          console.log('Prompt updated successfully');
          setPrompts(prompts.map(p => p.id === selectedPrompt.id ? { ...p, text: promptText } : p));
        })
        .catch(error => console.error('Error updating prompt:', error));
    }
  };

  const handleNewPrompt = () => {
    const newPrompt: Prompt = { id: Date.now(), name: 'New Prompt', text: '', is_active: true };
    PromptService.addPrompt({ prompt_name: newPrompt.name, prompt_text: newPrompt.text, created_by: 'current_user' }) // Replace 'current_user' with actual user
      .then(response => {
        console.log('Prompt added successfully');
        setPrompts([...prompts, newPrompt]);
        setSelectedPrompt(newPrompt);
        setPromptText('');
      })
      .catch(error => console.error('Error adding new prompt:', error));
  };

  const handleDeletePrompt = (id: number) => {
    PromptService.deletePrompt(id)
      .then(response => {
        console.log('Prompt deleted successfully');
        setPrompts(prompts.filter(prompt => prompt.id !== id));
        if (selectedPrompt?.id === id) {
          setSelectedPrompt(null);
          setPromptText('');
        }
      })
      .catch(error => console.error('Error deleting prompt:', error));
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