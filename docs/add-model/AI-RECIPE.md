# AI-RECIPE — คำสั่งสำหรับ AI agent เพิ่ม model ใหม่ (Frontend)

> **ไฟล์นี้เขียนถึง AI agent โดยตรง** ถ้าคุณเป็นคน ให้อ่าน [MANUAL.md](./MANUAL.md) แทน
> ปฏิบัติตามทีละขั้น ห้ามข้าม ห้ามเดาค่าที่ไม่ได้รับมา

---

## 0. Preconditions

### 0.1 ตรวจ INPUT

ใช้ INPUT SPEC ชุดเดียวกับฝั่ง backend ถ้า field **บังคับ** ขาด → **หยุดแล้วถาม ห้ามเดา**

| Field | บังคับ | ใช้ทำอะไรฝั่ง frontend |
|---|---|---|
| `send_config_type` | ✅ | คีย์ registry + ชื่อโฟลเดอร์ version |
| `generation_type` | ✅ | เลือก tab: `image` → `image-gen`, `video` → `video-gen`, `omnihumen` → `omni-human`, `dreamactor` → `dream-actor` |
| `inputs` | ✅ | upload UI + `uploadMode` + mapping ใน `buildSubmitPayload` |
| `controls` | ✅ | props ของ `SettingSection` + `features` |
| `request_payload_example` | ✅ | ตรวจว่า payload ที่ frontend ส่งครอบคลุมสิ่งที่ worker ต้องใช้ |
| `similar_to` | – | version ที่ให้ copy เป็นฐาน — ถ้าไม่ให้มา ให้เสนอแล้วรอยืนยัน |
| `model_name`, `provider_model_id` | – | ฝั่ง frontend ไม่ใช้ (มาจาก DB) แต่ใช้อ้างอิงตอนทดสอบ |

### 0.2 ตรวจว่า backend พร้อม

ถามผู้ใช้ / ตรวจว่า:
- row ใน `master_model_type` ถูกสร้างแล้ว มี `isActive: true` และ `sendConfig.type` = `send_config_type`
- `payloadBuilders["<send_config_type>"]` ที่ worker ลงทะเบียนแล้ว

ถ้ายังไม่พร้อม ให้ทำต่อได้ แต่ **ต้องเตือนใน output** ว่าทดสอบ end-to-end ยังไม่ได้

### 0.3 ตัดสิน Case

| เงื่อนไข | Case | ทำอะไร |
|---|---|---|
| `send_config_type` มีอยู่แล้วใน registry (payload เดิม) | **A** | **ไม่ต้องแก้อะไรฝั่ง frontend** รายงานแล้วจบ |
| `send_config_type` เป็นค่าใหม่ ภายใต้ tab ที่มีอยู่ | **B** | Step 1 → 6 |
| `generation_type` ไม่ใช่ 4 ค่าที่มี | **C** | **หยุด** แจ้งว่าต้องใช้ [NEW-TAB.md](./NEW-TAB.md) และต้องมีคนรีวิว |

ตรวจ Case A ด้วย:
```bash
grep -rn "<send_config_type>" "app/page/project/[id]/components" --include=*.ts --include=*.tsx
```

รายงานผลการตัดสินให้ผู้ใช้ทราบก่อนเริ่มแก้ไฟล์

---

## 1. อ่านของเดิมก่อนเขียน

อ่านไฟล์เหล่านี้ให้ครบก่อนสร้างอะไร (ห้ามข้าม — pattern แต่ละ tab ไม่เหมือนกัน):

- `app/page/project/[id]/components/tab-layout/types/generator-config.type.ts` — contract
- `app/page/project/[id]/components/tab-layout/model-registry.ts` — registry กลาง
- `.../tabs/<tab>/<x>-form-renderer.tsx` — registry ของ form component
- `.../tabs/<tab>/version/<similar_to>/config.ts` — ฐานของ config ใหม่
- `.../tabs/<tab>/version/<similar_to>/chat-<domain>-input.tsx` — ฐานของฟอร์มใหม่

---

## 2. สร้าง `config.ts`

ไฟล์: `app/page/project/[id]/components/tabs/<tab>/version/<send_config_type>/config.ts`

ชื่อ export ตาม convention: `<4 อักษรย่อ><เลขรุ่น>Config`
(`seedream1 → seedr1Config`, `seedance2 → seeda2Config`, `omnihuman → omih1Config`, `dreamactor → dreac1Config`)

```ts
import type {
  VideoModelConfig,
  VideoGeneratePayload,
  VideoFormState,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** <slug>: <อธิบายสั้น ๆ ว่าต่างจากรุ่นก่อนตรงไหน> */
export const <abbr>Config: VideoModelConfig = {
  buildSubmitPayload: (values, state, tempTaskId): VideoGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    // ← map field ที่เหลือจาก state ตาม inputs / controls
  }),
  features: { /* จาก controls */ },
};
```

**กฎบังคับ:**

1. `model: state.selectedAIModel?.modelType` — **ห้ามใช้ `sendConfig.type`**
   backend ค้นด้วยคู่ `(modelType, type)`
2. `buildSubmitPayload` ต้อง **pure** — ห้ามเรียก API / setState / อ่าน localStorage
   เพราะถูกเรียก 2 ครั้ง (ครั้งแรกผ่าน `getCreditPreSend` เพื่อประเมินเครดิต)
3. ต้องคืน field ครบตาม `XGeneratePayload` — field ที่โมเดลไม่ใช้ให้ใส่ค่ากลาง
   (`image: []`, `maxImages: 0`, `imageGenerateType: ""`) **ห้ามใส่ `undefined`** เพราะ DTO backend เป็น required
4. `features.uploadMode` ต้องตรงกับสิ่งที่ builder ฝั่ง worker คาดหวัง:
   - `"first-last"` → orchestrator เติม `refImageFirst` / `refImageLast` → payload ใช้ `image[0]`, `image[1]`
   - `"multi-file"` → orchestrator เติม `computedFiles` → payload ใช้ `files`
5. `typeGenerate` ต้องตรงกับ `generation_type`

---

## 3. สร้าง form component

ไฟล์: `.../version/<send_config_type>/chat-<domain>-input.tsx`
(`chat-image-input.tsx` / `chat-video-input.tsx` / `chat-omnihumen-input.tsx` / `chat-dreamactor-input.tsx`)

วิธี: **copy จาก `similar_to` แล้วแก้** ไม่ใช่เขียนใหม่จากศูนย์

**กฎบังคับ:**

1. รับ props ครบตาม `<X>InputProps` (ประกาศใน `chat-generate-<domain>.tsx`)
   — คัดลอก type `Props` มาทั้งก้อนจาก version ต้นแบบ
2. `export default function` component
3. `<Form form={form} onFinish={handleSendMessage} layout="vertical">`
   — **ต้องผ่าน `onFinish`** ห้ามเรียก `handleSendMessage` ตรง ๆ (validation จะไม่ทำงาน)
4. field prompt ต้องชื่อ `prompt` (builder อ่าน `values.prompt`)
5. control เฉพาะโมเดลให้เสียบผ่าน `<SettingSection extraContent={...} />`
   — **ห้ามแก้ `tab-layout/generate-section/setting-section.tsx`** เพื่อรองรับโมเดลเดียว
6. tab **video**: import `UploadSection` จาก `../../shared/upload-section` (ไม่ใช่ตัวใน `tab-layout/`)
   และถ้าต้องการ `@mentions` ให้ copy `prompt-section.tsx` จากโฟลเดอร์ version ต้นแบบมาด้วย
7. ถ้ามี ratio → size map ให้วางในไฟล์ฟอร์ม (แบบ `RATIO_SIZE_MAP` ของ seedance2)
   แล้วเรียก `setSelectedWidth` / `setSelectedHeight` เมื่อ ratio เปลี่ยน
8. ความหนาแน่นของ comment / การตั้งชื่อ / โครงสร้าง ให้เหมือนไฟล์ต้นแบบ

---

## 4. ลงทะเบียน — ขั้นนี้ห้ามลืมเด็ดขาด

| `generation_type` | ต้องแก้ |
|---|---|
| `image` | `tab-layout/model-registry.ts` (`imageConfigByType`) **และ** `tabs/image-gen/image-form-renderer.tsx` (`formComponentByType`) |
| `video` | `tab-layout/model-registry.ts` (`videoConfigByType`) **และ** `tabs/video-gen/video-form-renderer.tsx` (`formComponentByType`) |
| `omnihumen` | `tabs/omni-human/omnihumen-form-renderer.tsx` (`omniModelRegistry`) — ที่เดียว |
| `dreamactor` | `tabs/dream-actor/dreamactor-form-renderer.tsx` (`dreamactorModelRegistry`) — ที่เดียว |

คีย์ต้อง `=== send_config_type` เป๊ะ

ลืมที่ใดที่หนึ่ง → เลือกโมเดลแล้วจอว่างเปล่า **ไม่มี error ใน console**
(renderer เขียนว่า `if (!config || !FormComponent) return <></>;`)

**ห้ามให้ `model-registry.ts` import React component** — ไฟล์นั้นต้องเป็น plain data
เพราะ workflow import มันเข้ามาโดยไม่แตะฟอร์ม

---

## 5. Contract / orchestrator — แก้เฉพาะที่จำเป็น

### 5.1 `generator-config.type.ts`

แก้ต่อเมื่อ payload ต้องมี field ใหม่ หรือ `features` ต้องมี flag ใหม่

- field ใหม่ต้อง **optional** (config เดิมทุกตัวใช้ interface ร่วมกัน)
- ถ้าเพิ่ม field ใน `XGeneratePayload` → **ต้องแจ้งใน output** ว่า backend ต้องเพิ่มใน
  `ai-media-backend/libs/share/src/types/<type>-generate.ts` ด้วย ไม่งั้นค่าถูกทิ้งเงียบ ๆ

### 5.2 orchestrator `chat-generate-<domain>.tsx`

แก้ต่อเมื่อโมเดลต้องการ state ที่ยังไม่มี **ต้องแก้ครบ 4 จุดในคอมมิตเดียว**:

1. `XFormState` ใน `generator-config.type.ts`
2. `useState` ใน orchestrator
3. `buildCurrentState()` — ใส่ field ใหม่ลงใน object ที่ return
4. `XInputProps` + จุด render `<FormComponent ... />`

**ถ้าใช้ state เดิมได้ทั้งหมด → ห้ามแตะ orchestrator** เป็นไฟล์ที่ทุกโมเดลใช้ร่วมกัน

---

## 6. Verify — ต้องรันจริงก่อนรายงานเสร็จ

```bash
cd ai-media-frontend
npx tsc --noEmit
yarn lint
yarn build
grep -rn "<send_config_type>" "app/page/project/[id]/components" --include=*.ts --include=*.tsx
```

`grep` ต้องเจอ:
- image/video: **≥ 4 บรรทัด** (import + entry ใน `model-registry.ts`, import + entry ใน renderer) นอกเหนือจากไฟล์ในโฟลเดอร์ version
- omni/dream: **≥ 2 บรรทัด** ในไฟล์ renderer

ถ้า `tsc` / `lint` / `build` ล้มเหลว ให้แก้จนผ่าน ห้ามรายงานว่าเสร็จทั้งที่ยังไม่ผ่าน

---

## 7. Output contract — ต้องรายงานครบ 5 ข้อ

1. **Case ที่ตัดสิน** (A/B/C) พร้อมเหตุผล
2. **ไฟล์ที่สร้าง** — path + สรุปเนื้อหา
3. **ไฟล์ที่แก้** — path + บรรทัดที่เพิ่ม (โดยเฉพาะ 2 จุดลงทะเบียน)
4. **ผลการ verify** — output จริงของ `tsc` / `lint` / `build` / `grep`
5. **สิ่งที่ผู้ใช้ต้องทำต่อ** — manual test ตามลำดับนี้:
   - `yarn dev` → เปิด project → tab ที่เกี่ยว
   - เลือกโมเดลใหม่ใน dropdown → **ต้องเห็นฟอร์ม ไม่ใช่จอว่าง**
   - ตรวจตัวเลขเครดิตก่อนกด
   - กด generate → ดู payload ที่ `socket.emit` ใน DevTools
   - ผลลัพธ์ขึ้น gallery
   - รีเฟรช → โมเดลที่เลือกยังคงเดิม (localStorage)
   - image/video: เปิด Workflow tab → เลือกโมเดลใหม่ได้

ถ้ามีการเพิ่ม field ใน `XGeneratePayload` ต้องระบุชัดว่า **backend ต้องแก้ DTO ตามด้วย**

---

## 8. Guardrails — ห้ามทำ

- ❌ ห้ามเดา `inputs` / `controls` / `request_payload_example` — ขาดแล้วหยุดถาม
- ❌ ห้ามลืมลงทะเบียนครบทุกจุดตามตารางข้อ 4
- ❌ ห้ามใช้ `sendConfig.type` เป็นค่า `payload.model` (ต้องเป็น `modelType`)
- ❌ ห้ามใส่ side effect ใน `buildSubmitPayload`
- ❌ ห้ามแก้ `setting-section.tsx`, `prompt-section.tsx`, `upload-section.tsx` หรือ shared อื่น ๆ
  เพื่อรองรับโมเดลเดียว — ใช้ props / `extraContent` ที่มีอยู่
- ❌ ห้ามแก้ config หรือฟอร์มของโมเดลเดิม แม้เห็นโค้ดซ้ำ
  ถ้าเห็นว่าควร refactor ให้เขียนบรรทัดเดียวว่า
  `Suggestion: X would be better because Y — say the word and I'll refactor.`
- ❌ ห้ามให้ `model-registry.ts` import React component
- ❌ ห้ามใช้ `any` — ใช้ `unknown` แล้ว narrow (ตาม AGENTS.md ของ repo)
- ❌ ห้ามแตะ orchestrator ถ้าไม่จำเป็นจริง ๆ
- ❌ ห้ามทิ้ง `TODO` — ติดอะไรให้รายงานเป็นข้อความ
