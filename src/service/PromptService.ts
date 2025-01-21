import axios, { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints'; // Update with the correct path to your API endpoints file

// Define interfaces for the API responses and requests
interface Prompt {
  id: number;
  name: string;
  text: string;
  is_active: boolean;
}

interface NewPrompt {
  prompt_name: string;
  prompt_text: string;
  created_by: string;
}

interface UpdatePrompt {
  prompt_name?: string;
  prompt_text?: string;
  updated_by?: string;
}

class PromptService {
  // Fetch all prompts
  static async getAllPrompts(): Promise<Prompt[]> {
    const response: AxiosResponse<Prompt[]> = await axios.get(API_ENDPOINTS.GET_ALL_PROMPTS);
    return response.data;
  }

  // Fetch a specific prompt by ID
  static async getPromptById(id: number): Promise<Prompt> {
    try {
      const response: AxiosResponse<Prompt> = await axios.get(`${API_ENDPOINTS.GET_PROMPT}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Prompt with ID ${id} not found.`);
    }
  }

  // Add a new prompt
  static async addPrompt(newPrompt: NewPrompt): Promise<string> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.post(API_ENDPOINTS.ADD_PROMPT, newPrompt);
      return response.data.message;
    } catch (error) {
      throw new Error('Error adding new prompt.');
    }
  }

  // Update an existing prompt by ID
  static async updatePrompt(id: number, updatedData: UpdatePrompt): Promise<string> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.put(`${API_ENDPOINTS.UPDATE_PROMPT}/${id}`, updatedData);
      return response.data.message;
    } catch (error) {
      throw new Error(`Error updating prompt with ID ${id}.`);
    }
  }

  // Activate a specific prompt by ID
  static async activatePrompt(id: number): Promise<string> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.post(`${API_ENDPOINTS.ACTIVATE_PROMPT}/${id}`);
      return response.data.message;
    } catch (error) {
      throw new Error(`Error activating prompt with ID ${id}.`);
    }
  }

  // Delete a specific prompt by ID
  static async deletePrompt(id: number): Promise<string> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(`${API_ENDPOINTS.UPDATE_PROMPT}/${id}`);
      return response.data.message;
    } catch (error) {
      throw new Error(`Error deleting prompt with ID ${id}.`);
    }
  }
}

export default PromptService;
