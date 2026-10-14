"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Result, Spin } from "antd";

/** จำนวนวินาทีก่อนปิดหน้าต่างเองเมื่อเชื่อมสำเร็จ */
const AUTO_CLOSE_SECONDS = 3;

/**
 * หน้าที่ popup ของ OAuth เด้งกลับมาหลังเชื่อมบัญชี social
 *
 * backend (`GET /social-account/callback/:platform`) จัดการแลก token เสร็จแล้ว
 * แล้ว redirect มาที่นี่พร้อม `?social=success|error&message=…` — หน้านี้ทำหน้าที่
 * แจ้งผลและปิดตัวเอง ไม่ได้เรียก API เพิ่ม
 *
 * แท็บ Connections ที่เปิด popup ไว้จะ poll ว่า `popup.closed` แล้วหรือยัง
 * แล้ว refresh รายการบัญชีเอง — จึงไม่ต้องส่ง postMessage ข้าม origin
 *
 * จงใจวางไว้นอก /page/* (แบบเดียวกับ app/callback ของ Keycloak) ด้วยสองเหตุผล:
 *  1. /page/* ถูกครอบด้วย PrivateLayout — sidebar กับ header จะโผล่มาเต็ม
 *     ในหน้าต่าง popup ขนาด 680x760 ที่ปิดตัวเองใน 3 วินาที
 *  2. หน้านี้อ่านแค่ query string ไม่เรียก API และไม่ให้สิทธิ์อะไรเลย
 *     ความปลอดภัยจริงอยู่ที่ backend (state ที่ sign ไว้ + ตรวจ role ซ้ำ)
 *     จึงไม่จำเป็นต้องผ่าน auth middleware
 */
export default function SocialCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(AUTO_CLOSE_SECONDS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("social");
    setMessage(params.get("message") ?? "");
    setStatus(result === "success" ? "success" : "error");
  }, []);

  // ปิดเองเมื่อสำเร็จ — ถ้าพลาดปล่อยให้ผู้ใช้อ่านข้อความก่อนแล้วกดปิดเอง
  useEffect(() => {
    if (status !== "success") return;
    const timer = window.setInterval(() => {
      setCountdown((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          window.close();
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  if (status === "loading") {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" style={{ minHeight: "100vh", padding: 24 }}>
      <Result
        status={status === "success" ? "success" : "error"}
        title={
          status === "success" ? "Account connected" : "Could not connect"
        }
        subTitle={
          message ||
          (status === "success"
            ? "You can close this window."
            : "Please try again.")
        }
        extra={
          <Button type="primary" onClick={() => window.close()}>
            {status === "success"
              ? `Close (${countdown})`
              : "Close"}
          </Button>
        }
      />
    </Flex>
  );
}
