export interface ModelPermission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group: null | string;
  is_blocking: boolean;
}
export interface OpenAIModel {
  id: string;
  object: string;
  owned_by: string;
  permission: ModelPermission[];
  context_window: number;
  knowledge_cutoff: string;
  image_support: boolean;
  preferred: boolean;
  deprecated: boolean;
}


export interface ModelDetails {
  contextWindowSize: number;
  knowledgeCutoffDate: string;
  imageSupport: boolean;
  preferred: boolean;
  deprecated: boolean;
}

export const modelDetails: { [key: string]: ModelDetails } = {

  "gpt-3.5-turbo": {

    contextWindowSize: 4096,

    knowledgeCutoffDate: "2021-09",

    imageSupport: false,

    preferred: true,

    deprecated: false,

  },

};