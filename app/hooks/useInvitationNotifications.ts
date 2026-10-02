import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { axiosUser } from "@/app/lib/axios/axios";
import OrganizationServices from "@/app/services/organization.service";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import type { IPendingInvitation } from "@/app/common/organization.type";

/** ต้องตรงกับ INVITATION_CHANGED_EVENT ของ core websocket */
const INVITATION_CHANGED_EVENT = "invitation:changed";

/** คำเชิญเข้า organization ที่ยังรอตอบของ user ที่ login อยู่ — อัปเดตทันทีผ่าน socket */
export const useInvitationNotifications = () => {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const { socket, isConnected } = useWebSocket();
  const organizationService = useMemo(() => OrganizationServices(axiosUser), []);
  const [invitations, setInvitations] = useState<IPendingInvitation[]>([]);

  const refresh = useCallback(async () => {
    if (!email) return;
    setInvitations(await organizationService.findPendingInvitations(email));
  }, [email, organizationService]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket || !isConnected || !email) return;
    // ห้องหายเมื่อ reconnect — join ใหม่และโหลดซ้ำเพื่อเก็บคำเชิญที่หลุดไประหว่างนั้น
    socket.emit("join-invitations", { email });
    refresh();
    socket.on(INVITATION_CHANGED_EVENT, refresh);
    return () => {
      socket.off(INVITATION_CHANGED_EVENT, refresh);
    };
  }, [socket, isConnected, email, refresh]);

  return { invitations, refresh };
};
