import { AxiosInstance } from "axios";
import {
  SaveManualTokenPayload,
  SocialAccount,
  SocialPlatform,
} from "@/app/common/activity-share.type";

/**
 * client ของ /social-account บน users service
 * (อยู่คนละ service กับ activity-share เพราะ OAuth callback อยู่รวมกับ auth เดิม)
 */
const SocialAccountServices = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/social-account";

  return {
    findMany: async (organizationId: string): Promise<SocialAccount[]> => {
      const res = await axiosInstance.get(baseUrl, {
        params: { organizationId },
      });
      return res.data;
    },

    /**
     * ขอ URL หน้า consent ของ platform
     *
     * ไม่ redirect ให้เอง — คืน URL ให้ caller เปิด popup แล้วรอ event `social-connected`
     * จากหน้า callback เพื่อจะได้ refresh รายการโดยไม่ต้องออกจากหน้าเดิม
     *
     * @param platform platform ที่จะเชื่อม
     * @param organizationId org ที่บัญชีจะไปผูก
     * @param userId ผู้กดเชื่อม (ต้องเป็น OWNER/ADMIN)
     * @returns URL ของหน้า consent
     */
    getConnectUrl: async (
      platform: SocialPlatform,
      organizationId: string,
      userId: string
    ): Promise<{ authorizeUrl: string }> => {
      const res = await axiosInstance.get(`${baseUrl}/connect/${platform}`, {
        params: { organizationId, userId },
      });
      return res.data;
    },

    /**
     * บันทึก token ที่แอดมินระบบวางมือ (SUPER_ADMIN เท่านั้น)
     *
     * backend ตรวจ token กับ provider ก่อนเขียน DB — error ที่ throw ออกมาจึงมี
     * ข้อความจริงจาก provider ให้เอาไปโชว์ในฟอร์มได้เลย
     *
     * @param payload บัญชีและ token (เว้น accessToken ว่าง = คงค่าเดิม)
     * @returns บัญชีที่บันทึกแล้ว (ไม่มี token)
     */
    saveManualToken: async (
      payload: SaveManualTokenPayload
    ): Promise<SocialAccount> => {
      const res = await axiosInstance.post(`${baseUrl}/manual`, payload);
      return res.data;
    },

    disconnect: async (
      id: string,
      userId: string
    ): Promise<{ id: string }> => {
      const res = await axiosInstance.delete(`${baseUrl}/${id}`, {
        params: { userId },
      });
      return res.data;
    },
  };
};

export default SocialAccountServices;
