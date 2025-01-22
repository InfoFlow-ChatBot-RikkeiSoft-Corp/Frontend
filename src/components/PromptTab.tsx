import React, { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import PromptService from '../service/PromptService';
import { AuthService } from '../service/AuthService';
import { NotificationService } from '../service/NotificationService';
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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await PromptService.getAllPrompts();
      setPrompts(response);
    } catch (error) {
      NotificationService.handleError('Error fetching prompts');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptText(prompt.text);
    setIsEditing(false);
  };

  const handleEditPrompt = () => {
    setIsEditing(true);
  };

  const handleSavePrompt = async () => {
    const currentUser = AuthService.getUsername();
    if (!currentUser) {
      NotificationService.handleError('No user is logged in.');
      return;
    }

    if (selectedPrompt) {
      setLoading(true);
      try {
        await PromptService.updatePrompt(selectedPrompt.id, { prompt_text: promptText, updated_by: currentUser });
        setPrompts(prompts.map(p => p.id === selectedPrompt.id ? { ...p, text: promptText } : p));
        setIsEditing(false);
        NotificationService.handleSuccess('Prompt updated successfully');
      } catch (error) {
        NotificationService.handleError('Error updating prompt');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewPrompt = async () => {
    const currentUser = AuthService.getUsername();
    if (!currentUser) {
      NotificationService.handleError('No user is logged in.');
      return;
    }

    const newPrompt: Prompt = { id: Date.now(), name: 'New Prompt', text: '', is_active: true };
    setLoading(true);
    try {
      await PromptService.addPrompt({ prompt_name: newPrompt.name, prompt_text: newPrompt.text, created_by: currentUser });
      setPrompts([...prompts, newPrompt]);
      setSelectedPrompt(newPrompt);
      setPromptText('');
      setIsEditing(true);
      NotificationService.handleSuccess('New prompt added successfully');
    } catch (error) {
      NotificationService.handleError('Error adding new prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    setLoading(true);
    try {
      await PromptService.deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      setSelectedPrompt(null);
      setPromptText('');
      setIsEditing(false);
      NotificationService.handleSuccess('Prompt deleted successfully');
    } catch (error) {
      NotificationService.handleError('Error deleting prompt');
    } finally {
      setLoading(false);
    }
  };

  const editPromptName = (prompt: Prompt) => {
    const newName = prompt.name + ' (edited)';
    const updatedPrompt: Prompt = { ...prompt, name: newName };
    setPrompts(prompts.map(p => p.id === prompt.id ? updatedPrompt : p));
  };

  return (
    <div className="prompt-tab-container">
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
      <div className="prompt-main">
        <textarea
          className="prompt-text prompt-textarea"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          readOnly={!isEditing}
        />
        <div className="prompt-footer">
          {isEditing ? (
            <button
              className="save-prompt-button"
              onClick={handleSavePrompt}
            >
              <PlusIcon className="h-4 w-4" />
              Save
            </button>
          ) : (
            <button
              className="edit-prompt-button"
              onClick={handleEditPrompt}
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptTab;