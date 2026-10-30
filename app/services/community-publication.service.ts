import { AxiosInstance } from "axios";
import type {
  IntegrationApiKey,
  IntegrationApiKeyScope,
  PublishRequest,
  PublishResult,
} from "../common/org-gallery.type";

/** ทุก method throw เมื่อพลาด ให้หน้าจอแสดงสาเหตุเอง */
const CommunityPublicationServices = (axiosInstance: AxiosInstance) => ({
  publish: async (payload: PublishRequest): Promise<PublishResult[]> => {
    const { data } = await axiosInstance.post("/community/publications", payload);
    return data;
  },
  unpublish: async (publicationId: string): Promise<void> => {
    await axiosInstance.delete(`/community/publications/${publicationId}`);
  },
  listApiKeys: async (): Promise<IntegrationApiKey[]> => {
    const { data } = await axiosInstance.get("/integration-api-keys");
    return data;
  },
  createApiKey: async (payload: {
    name: string;
    scopes: IntegrationApiKeyScope[];
  }): Promise<IntegrationApiKey & { key: string }> => {
    const { data } = await axiosInstance.post("/integration-api-keys", payload);
    return data;
  },
  revokeApiKey: async (id: string): Promise<IntegrationApiKey> => {
    const { data } = await axiosInstance.delete(`/integration-api-keys/${id}`);
    return data;
  },
});

export default CommunityPublicationServices;
