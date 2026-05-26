export interface TMasterModelType {
  id: number;
  name: string;
  modelType: string | null;
  type: string | null;
  description: string | null;
  isDefault: boolean;
  modelDetails: any | null;
  createdAt: string;
  updatedAt: string;
  sendConfig?: {
    type: string;
  };
}
