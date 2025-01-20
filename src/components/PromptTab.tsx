import React, { useState, useEffect } from 'react';
import { AuthService } from '../service/AuthService'; // Adjust the import according to your project structure
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

  const handlePromptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  return (
    <div className="prompt-tab-container">
      {/* Sidebar */}
      <div className="prompt-sidebar">
        <div className="scrollbar-trigger">
          <h2 className="sr-only">Prompt List</h2>
          <button className="new-prompt-button" onClick={handleNewPrompt}>New Prompt</button>
          <nav aria-label="Prompt List">
            {prompts.map((prompt: Prompt) => (
              <div
                key={prompt.id}
                className={`prompt-item ${selectedPrompt?.id === prompt.id ? 'selected' : ''}`}
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt.name}
              </div>
            ))}
          </nav>
        </div>
      </div>
      {/* Main Page */}
      <div className="prompt-main">
        {selectedPrompt && (
          <>
            <textarea
              className="prompt-textarea"
              value={promptText}
              onChange={handlePromptTextChange}
            />
            <button
              className="save-prompt-button"
              onClick={handleSavePrompt}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PromptTab;