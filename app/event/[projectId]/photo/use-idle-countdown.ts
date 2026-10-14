import { useEffect, useRef, useState } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

/** นับถอยหลังเมื่อไม่มีการแตะหน้าจอ แล้วเรียก onIdle ครั้งเดียว — นับใหม่ทุกครั้งที่ active เปลี่ยน */
export const useIdleCountdown = (
  active: boolean,
  seconds: number,
  onIdle: () => void,
): number => {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const lastActivityRef = useRef(Date.now());
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!active) return;
    lastActivityRef.current = Date.now();
    setSecondsLeft(seconds);

    const markActivity = () => {
      lastActivityRef.current = Date.now();
      setSecondsLeft(seconds);
    };
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActivity));
    const timer = setInterval(() => {
      const left = seconds - Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        onIdleRef.current();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActivity));
    };
  }, [active, seconds]);

  return secondsLeft;
};
