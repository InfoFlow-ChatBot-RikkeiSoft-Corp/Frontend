import { createContext, useContext } from 'react';
import { OpenAIModel } from "./models/model";

interface ModelsContextState {
  model: OpenAIModel;
}

const defaultModel: OpenAIModel = {
  id: "gpt-3.5-turbo",
  object: "model",
  owned_by: "openai",
  permission: [],
  context_window: 4096,
  knowledge_cutoff: "9/2021",
  image_support: false,
  preferred: false,
  deprecated: false
};

const ModelsContext = createContext<ModelsContextState>({
  model: defaultModel
});

export const useModelsContext = () => useContext(ModelsContext);

export default ModelsContext;