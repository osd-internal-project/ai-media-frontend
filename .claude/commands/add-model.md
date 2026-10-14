---
description: เพิ่ม AI generation model ใหม่เข้าระบบ (frontend — config + form + registry)
argument-hint: [ชื่อ model หรือ path ของไฟล์ input ที่กรอกแล้ว]
---

เพิ่ม AI generation model ใหม่เข้า ai-cave ฝั่ง frontend

ข้อมูลจากผู้ใช้: $ARGUMENTS

## ทำตามลำดับนี้

1. **อ่าน `docs/add-model/AI-RECIPE.md` ให้จบก่อน** แล้วทำตามทุกขั้นในนั้น
   ไฟล์นั้นคือ spec ของงานนี้ ไม่ใช่ข้อเสนอแนะ

2. ถ้า `$ARGUMENTS` เป็น path ของไฟล์ ให้อ่านไฟล์นั้นเป็น INPUT
   ถ้าเป็นแค่ชื่อ model หรือว่างเปล่า ให้ถามผู้ใช้ตาม INPUT SPEC ใน recipe

3. **ห้ามเดา** `inputs`, `controls`, `request_payload_example` — ขาดตัวไหนหยุดถามก่อน

4. ตรวจก่อนว่า backend พร้อมแล้ว (row มี `isActive: true` และ worker ลงทะเบียน
   `payloadBuilders["<send_config_type>"]` แล้ว) ถ้ายัง ทำต่อได้แต่ต้องเตือนว่าทดสอบจริงยังไม่ได้

5. ตัดสิน Case (A / B / C) แล้วรายงานให้ผู้ใช้ทราบก่อนเริ่มแก้ไฟล์

6. อ่านไฟล์ต้นแบบตามข้อ 1 ของ recipe ให้ครบก่อนเขียนโค้ด — pattern แต่ละ tab ไม่เหมือนกัน

7. ทำจนครบแล้วรัน verify จริง: `npx tsc --noEmit`, `yarn lint`, `yarn build`, `grep`

8. รายงานตาม Output contract ในข้อ 7 ของ recipe ให้ครบทั้ง 5 ข้อ

## เตือนเสมอ

- **ลงทะเบียนให้ครบ** — image/video ต้องแก้ 2 ที่ (`model-registry.ts` + `<x>-form-renderer.tsx`),
  omni/dream แก้ที่เดียวใน renderer ลืมที่ใดที่หนึ่ง = จอว่างเปล่าโดยไม่มี error
- ถ้าเพิ่ม field ใน `XGeneratePayload` ต้องบอกผู้ใช้ว่า backend ต้องเพิ่มใน
  `ai-media-backend/libs/share/src/types/<type>-generate.ts` ตามด้วย
