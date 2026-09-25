/** ลิงก์หน้า share สาธารณะที่ฝังใน QR code — อยู่นอก /event และ /page จึงเปิดได้โดยไม่ต้อง login */
export const buildPhotoShareUrl = (generationId: string): string =>
  `${window.location.origin}/share/photo/${generationId}`;

export const buildKioskUrl = (projectId: string): string =>
  `/event/${projectId}/photo`;
