# เพิ่ม AI model ใหม่ — Frontend

ชุดเอกสารสำหรับเพิ่ม AI generation model เข้า ai-cave ฝั่ง frontend
ฝั่ง backend มีชุดคู่กันที่ `ai-media-backend/docs/add-model/` — **ทำ backend ก่อนเสมอ**

---

## เลือกไฟล์ที่ต้องอ่าน

| ไฟล์ | อ่านเมื่อ |
|---|---|
| [MANUAL.md](./MANUAL.md) | คุณจะทำเอง อยากรู้ขั้นตอนและเหตุผล |
| [AI-RECIPE.md](./AI-RECIPE.md) | จะให้ Claude Code ทำให้ — ไฟล์นี้เขียนถึง AI โดยตรง |
| [REFERENCE.md](./REFERENCE.md) | contract ของ `XFormState`/`XGeneratePayload`/`features`, shared components, กับดัก |
| [NEW-TAB.md](./NEW-TAB.md) | tab ใหม่ทั้งหมด (เช่น audio) — งานใหญ่ ต้องมีคนรีวิว |
| [example-seedance2.input.md](./example-seedance2.input.md) | **ตัวอย่าง INPUT ที่กรอกครบแล้ว** ย้อนรอยจาก seedance2 ของจริง — copy ไปแก้ได้เลย |

---

## ระบบทำงานยังไง (60 วินาที)

ทุกอย่างผูกกันด้วยสตริงเดียวคือ **`selectedAIModel.sendConfig.type`** ที่มาจาก DB

```
page.tsx
  fetch masterModelTypeServices.findAll()  →  filter m.type === activeKey
  resolveModel(): localStorage → isDefault → ตัวแรก
  │
  └─ <XFormRenderer selectedAIModel>
        type   = selectedAIModel.sendConfig.type
        config = getXModelConfig(model)     ← tab-layout/model-registry.ts
        Form   = formComponentByType[type]  ← ในไฟล์ renderer เอง
        ถ้าขาดอย่างใดอย่างหนึ่ง → <></> (จอว่าง ไม่มี error)
        │
        └─ <ChatGenerateX modelConfig FormComponent>
              buildCurrentState() → XFormState
              modelConfig.buildSubmitPayload(values, state, tempTaskId)
              socket.emit("generate:video", payload)  →  backend
```

**จำนวนจุดที่ต้องลงทะเบียน:**

| Tab | จุด |
|---|---|
| image, video | **2** — `model-registry.ts` + `<x>-form-renderer.tsx` |
| omnihumen, dreamactor | **1** — ใน renderer ที่เดียว |

image/video แยก config ออกจาก component เพราะ **Workflow ใช้ config ซ้ำ** โดยไม่แตะ React —
ลงทะเบียนใน `model-registry.ts` แล้วโมเดลใหม่ใช้ใน Workflow ได้ทันที

---

## 3 Case

| Case | สถานการณ์ | งานฝั่ง frontend |
|---|---|---|
| **A** | `sendConfig.type` เดิม (payload เหมือนเดิมเป๊ะ) | **ไม่ต้องทำอะไร** โมเดลโผล่ใน dropdown เอง ใช้ฟอร์มเดิม |
| **B** | `sendConfig.type` ใหม่ ภายใต้ tab ที่มีอยู่ | `config.ts` + form component + ลงทะเบียน |
| **C** | tab ใหม่ทั้งหมด | [NEW-TAB.md](./NEW-TAB.md) |

---

## วิธีเรียกใช้ให้ AI ทำให้

**แบบ slash command** (แนะนำ):

```
/add-model
```

แล้วพิมพ์ข้อมูลตาม INPUT SPEC ข้างล่างต่อท้าย หรือใส่ path ของไฟล์ที่กรอกไว้:

```
/add-model docs/add-model/new-model.input.md
```

**แบบพิมพ์เอง:**

```
อ่าน docs/add-model/AI-RECIPE.md แล้วเพิ่ม model นี้ให้หน่อย
<แปะ INPUT SPEC ที่กรอกแล้ว>
```

AI จะถามกลับถ้าข้อมูลบังคับขาด — **อย่าบอกให้มันเดา**

---

## INPUT SPEC — ข้อมูลที่ต้องกรอก

ชุดเดียวกับฝั่ง backend กรอกครั้งเดียวใช้ได้ทั้งสอง repo

```yaml
model_name:              # ชื่อที่โชว์ใน dropdown เช่น "Seedance 3.0 Pro"
provider_model_id:       # model id ของ provider เช่น "seedance-3-0-pro-260601"
generation_type:         # image | video | omnihumen | dreamactor
modes:                   # เช่น [text-to-video, image-to-video]
send_config_type:        # slug เช่น "seedance3" — คีย์ registry ทั้งระบบ
send_api:                # URL สร้าง task (backend ใช้)
task_poll_api:           # URL base ของ poll (backend ใช้)
task_poll_sec: 10        # optional
auth_mode: llm-gateway   # optional

request_payload_example: |
  # JSON body จริงที่ provider รับ — บังคับ ห้ามเดา
  { "model": "...", "content": [ ... ], "ratio": "16:9", "duration": 5 }

response_example: |
  { "id": "cgt-2026..." }
  { "status": "succeeded", "content": { "video_url": "https://..." } }

inputs:                  # input ที่โมเดลรับ + role + จำนวนสูงสุด
  - prompt (required)
  - image ×2 → first_frame / last_frame
  - audio ×1 → reference_audio

controls:                # ตัวเลือกที่ user ปรับได้ใน UI  ← ฝั่ง frontend ใช้อันนี้มากที่สุด
  ratio: ["16:9", "9:16", "1:1"]
  resolution: ["480p", "720p", "1080p"]
  duration: { min: 3, max: 15 }
  audio: true
  draft: true

pricing:
  calculationType: FORMULA
  creditFormula: "body.duration * 42"

similar_to: seedance2    # optional แต่ช่วยมาก
is_default: false        # optional
```

| Field | บังคับ | ฝั่ง frontend เอาไปทำอะไร |
|---|---|---|
| `send_config_type` | ✅ | คีย์ registry + ชื่อโฟลเดอร์ version |
| `generation_type` | ✅ | เลือก tab: `image`→`image-gen`, `video`→`video-gen`, `omnihumen`→`omni-human`, `dreamactor`→`dream-actor` |
| `inputs` | ✅ | upload UI + `features.uploadMode` + mapping ใน payload |
| `controls` | ✅ | props ของ `SettingSection` + `features` |
| `request_payload_example` | ✅ | ตรวจว่า payload ครอบคลุมสิ่งที่ worker ต้องใช้ |
| `similar_to` | – | version ที่ copy เป็นฐาน — ไม่ให้มา AI จะเสนอแล้วรอยืนยัน |
| อื่น ๆ | – | ใช้ฝั่ง backend เป็นหลัก |

---

## กับดัก 3 อันดับแรก

1. **เลือกโมเดลแล้วจอว่างเปล่า ไม่มี error** = ลงทะเบียนไม่ครบ
   (`if (!config || !FormComponent) return <></>` ใน renderer) — เช็ค 2 จุดตามตารางข้างบน
2. **`payload.model` ต้องเป็น `state.selectedAIModel?.modelType`** ไม่ใช่ `sendConfig.type`
   backend ค้นด้วยคู่ `(modelType, type)`
3. **เพิ่ม field ใน `XGeneratePayload` แล้วไม่เพิ่มใน DTO backend** → ค่าถูกทิ้งเงียบ ๆ ไม่มี error

รายการเต็มอยู่ใน [REFERENCE.md §7–8](./REFERENCE.md#7-known-divergences-)
