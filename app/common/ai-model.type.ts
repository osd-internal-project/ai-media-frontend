export type TModelDetails = {
  modelId?: string;
  description?: string;
  pricing?: {
    imageToVideo?: number;
    textToVideo?: number;
    imageToImage?: number;
    textToImage?: number;
    unit?: string; // "USD/M tokens" or "USD/Piece"
  };
  modalities?: {
    input?: string[];
    output?: string[];
  };
  limitations?: {
    resolution?: string[];
    duration?: string;
    frameRate?: string;
    concurrentTasks?: number;
    rpm?: string;
  };
  status?: string;
  freeCredits?: number;
};

export type TAIModel = {
  id: number;
  name: string;
  type: string;
  mode: string;
  isDefault?: boolean;
  capabilities?: string[];
  modelDetails?: TModelDetails;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type TAIModelResponse = {
  data: TAIModel[];
  message: string;
  success: boolean;
};