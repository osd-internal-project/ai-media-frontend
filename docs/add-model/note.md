Backend — ai-media-backend/docs/add-model/
ไฟล์	เนื้อหา
README.md	จุดเข้า + flow diagram + INPUT SPEC + วิธีเรียกใช้
MANUAL.md	6 step สำหรับคน: DB row → DTO → payload builder → poll → pricing → verify
AI-RECIPE.md	spec ที่เขียนถึง AI โดยตรง + code template + output contract + guardrails
REFERENCE.md	ทุกคอลัมน์ของ master_model_type + socket events + pricing + 8 gotchas
NEW-TAB.md	Case C: BaseGenerateService subclass, queue, gateway, processor
Frontend — ai-media-frontend/docs/add-model/
โครงเดียวกัน 5 ไฟล์ (README · MANUAL · AI-RECIPE · REFERENCE · NEW-TAB) ครอบ config.ts + form component + registry + contract

เรียกใช้

/add-model                                    # แล้วกรอกข้อมูลตาม INPUT SPEC
/add-model docs/add-model/new-model.input.md  # หรือชี้ไฟล์ที่กรอกไว้
slash command อยู่ที่ .claude/commands/add-model.md ทั้งสอง repo และเพิ่มบรรทัดชี้ทางใน AGENTS.md ของแต่ละ repo แล้ว

สิ่งที่เอกสารจับไว้เป็นหลัก
sendConfig.type คือคีย์เดียวที่ผูกทั้งระบบ — DB row → payloadBuilders (worker) → model-registry.ts + *-form-renderer.tsx (FE)
INPUT SPEC ชุดเดียวใช้ได้ทั้ง 2 repo กรอกครั้งเดียว มี field บังคับ/optional + default ระบุชัด และ recipe สั่งให้ AI หยุดถามเมื่อขาด ห้ามเดา (โดยเฉพาะ request_payload_example)
3 Case — A: payload เดิม → insert row อย่างเดียว, B: builder ใหม่, C: tab ใหม่ (ทำเครื่องหมายว่าต้องมีคนรีวิว)
กับดักที่พบจากการอ่านโค้ดจริงถูกเขียนไว้ครบ: isActive default false แต่ GET /ai-models ไม่กรอง → โผล่ใน dropdown แล้วเจอ "Model not found", image/video ต้องลงทะเบียน 2 ที่ ลืมแล้วจอว่างโดยไม่มี error, seed file ใช้ type: "vdo" ที่ไม่มีวันแมตช์, video มี prompt-section.tsx/upload-section.tsx เวอร์ชันของตัวเอง, JSDoc ใน omni/dream renderer stale
ตรวจ path และเลขบรรทัดทุกอันที่อ้างในเอกสารกับไฟล์จริงแล้ว — ลิงก์ relative ทั้งหมดชี้ถูก

Suggestion: union activeKey ถูกประกาศซ้ำใน 10 ไฟล์ — รวมเป็น type เดียวใน app/common/ จะทำให้ Case C เหลืองานไล่แก้น้อยลงมาก say the word and I'll refactor.

REFERENCE.md
ถ้าอยากเพิ่ม model ใหม่ต้องบอก ai ว่าอะไรมั้ง
สั้นที่สุด: เปิด repo แล้วพิมพ์ /add-model + แปะบล็อกนี้ที่กรอกแล้ว

ต้องบอกอะไรบ้าง

model_name:              # ชื่อที่จะโชว์ใน dropdown เช่น "Seedance 3.0 Pro"
provider_model_id:       # model id ของ provider เช่น "seedance-3-0-pro-260601"
generation_type:         # image | video | omnihumen | dreamactor
modes:                   # [text-to-video, image-to-video] → 1 row ต่อ 1 mode
send_config_type:        # slug ใหม่ เช่น "seedance3"
send_api:                # URL ที่ยิงไปสร้าง task
task_poll_api:           # URL base ของการถามสถานะ

request_payload_example: |
  { "model": "...", "content": [...], "ratio": "16:9", "duration": 5 }

response_example: |
  { "id": "cgt-2026..." }                                       # ตอน submit
  { "status": "succeeded", "content": { "video_url": "..." } }   # ตอน poll

inputs:
  - prompt (required)
  - image ×2 → first_frame / last_frame
  - audio ×1 → reference_audio

controls:
  ratio: ["16:9", "9:16", "1:1"]
  resolution: ["480p", "720p", "1080p"]
  duration: { min: 3, max: 15 }
  audio: true
  draft: true

pricing:
  calculationType: FORMULA
  creditFormula: "body.duration * 42"

similar_to: seedance2    # optional แต่ช่วยมาก
4 อย่างที่ขาดไม่ได้จริง ๆ
request_payload_example — JSON body จริงที่ provider รับ ตัวนี้สำคัญที่สุด ถ้าไม่มี AI จะเขียน payload builder ไม่ได้ และเดาผิด = job ตายที่ worker หลังหักเครดิตไปแล้ว
response_example — ทั้งตอน submit และตอน poll เพื่อหาว่า task id กับ URL ผลลัพธ์อยู่ path ไหน
inputs — รับอะไรบ้าง อย่างละกี่ไฟล์ role ชื่ออะไร
controls — user ปรับอะไรได้บ้าง (นี่คือสิ่งที่กลายเป็นหน้าฟอร์ม)
ที่เหลือ (task_poll_sec, auth_mode, is_default) มี default ให้อยู่แล้ว ไม่ต้องกรอก

ถ้ามีแค่ลิงก์เอกสาร provider
บอกไปตรง ๆ ได้เลย:


/add-model
โมเดลใหม่ seedance 3.0 ของ BytePlus เอกสารอยู่ที่ <URL>
ที่เหลือช่วยไล่ถามเอาจากผมทีละข้อ
AI จะไล่ถามตาม INPUT SPEC ให้เอง — แต่อย่าบอกให้มันเดา payload ถ้าไม่มี JSON ตัวอย่างจริงให้ไปยิง provider ทดสอบมาก่อน 1 ครั้ง

ลำดับที่ควรทำ
ทำ backend ก่อนเสมอ แล้วค่อย frontend — ใช้ข้อมูลชุดเดียวกันทั้งสองรอบ


cd ai-media-backend  && claude   → /add-model <แปะข้อมูล>
cd ai-media-frontend && claude   → /add-model <แปะข้อมูลชุดเดิม>
send_config_type ต้องเป็นค่าเดียวกันเป๊ะทั้งสองรอบ นั่นคือสิ่งที่ผูก DB ↔ worker ↔ ฟอร์ม เข้าด้วยกัน

กรณีที่ไม่ต้องบอกอะไรมาก
ถ้าโมเดลใหม่ payload เหมือนตัวเดิมเป๊ะ (provider แค่ปล่อยรุ่นใหม่ที่รับ field เดิม) → เป็น Case A ไม่ต้องแตะโค้ดเลย บอกแค่ model_name + provider_model_id + generation_type + modes + บอกว่าใช้ send_config_type เดิมตัวไหน แล้ว AI จะสร้าง JSON สำหรับ POST /master-model-type ให้อย่างเดียว