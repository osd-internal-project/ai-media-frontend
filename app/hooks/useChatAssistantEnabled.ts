"use client";

import { useEffect, useState } from "react";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";

// ทุก prompt-section ในหน้าเดียวกันใช้คำขอเดียวกัน — ไม่ยิงซ้ำตามจำนวนแท็บ
let pending: Promise<boolean> | null = null;

function fetchEnabled(): Promise<boolean> {
  pending ??= ChatAssistantService(axiosChatAssistant)
    .getSetting()
    .then((setting) => setting.enabled === true)
    .catch((err: unknown) => {
      // โหลดไม่ได้ = ซ่อนไว้ก่อน และให้ลองใหม่รอบหน้า
      console.error("[ChatAssistant] getSetting:", err);
      pending = null;
      return false;
    });
  return pending;
}

/** super admin เปิดผู้ช่วยแชทไว้หรือไม่ (false ระหว่างโหลดและเมื่อโหลดไม่ได้) */
export function useChatAssistantEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchEnabled().then((value) => {
      if (!cancelled) setEnabled(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return enabled;
}
