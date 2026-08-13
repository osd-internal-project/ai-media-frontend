# MANUAL — เพิ่ม AI model ใหม่ด้วยมือ (Frontend)

เอกสารนี้เขียนให้ **คน** อ่าน มีคำอธิบายว่าทำไมต้องทำแต่ละขั้น
ถ้าจะให้ AI ทำให้อัตโนมัติ ใช้ [AI-RECIPE.md](./AI-RECIPE.md) แทน
ตาราง contract / gotchas อยู่ใน [REFERENCE.md](./REFERENCE.md)

**ทำฝั่ง backend ให้เสร็จก่อน** (`ai-media-backend/docs/add-model/MANUAL.md`)
เพราะ frontend ต้องรอ row ใน `master_model_type` ถึงจะเห็นโมเดลใน dropdown

---

## Step 0 — เลือก Case

| Case | เมื่อไหร่ | ทำอะไร |
|---|---|---|
| **A** | payload เหมือนโมเดลเดิมเป๊ะ ใช้ `sendConfig.type` เดิม | **ไม่ต้องทำอะไรฝั่ง frontend เลย** โมเดลใหม่จะโผล่ใน dropdown และใช้ฟอร์มเดิมทันที |
| **B** | `sendConfig.type` เป็นค่าใหม่ | Step 1 → 6 |
| **C** | tab ใหม่ทั้งหมด | ดู [NEW-TAB.md](./NEW-TAB.md) |

ที่เหลือของเอกสารนี้คือ **Case B**

ตัวอย่างที่ใช้ตลอด: โมเดล video ใหม่ `sendConfig.type = "seedance3"`
สำหรับ tab อื่นให้แทน `video-gen` → `image-gen` / `omni-human` / `dream-actor` ตามตาราง

---

## Step 1 — สร้าง `config.ts`

ไฟล์: `app/page/project/[id]/components/tabs/video-gen/version/seedance3/config.ts`

```ts
import type {
  VideoModelConfig,
  VideoGeneratePayload,
  VideoFormState,
} from "@/app/page/project/[id]/components/tab-layout/types/generator-config.type";

/** seeda3: <อธิบายสั้น ๆ ว่าโมเดลนี้ต่างจากตัวก่อนตรงไหน> */
export const seeda3Config: VideoModelConfig = {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: VideoFormState,
    tempTaskId: string,
  ): VideoGeneratePayload => ({
    taskId: tempTaskId,
    model: state.selectedAIModel?.modelType ?? undefined,
    prompt: values.prompt as string,
    image: [],
    files: state.computedFiles,
    sequentialImageGeneration: "auto",
    resolution: state.selectedResolution,
    maxImages: 0,
    watermark: false,
    ratio: state.selectedRatio,
    projectId: state.projectId,
    userId: state.userId,
    width: state.selectedWidth,
    height: state.selectedHeight,
    imageGenerateType: "",
    typeGenerate: "video",
    duration: state.selectedDuration,
    generateAudio: state.selectedAudio,
    draft: state.draftMode,
    organizationId: state.organizationId,
  }),
  features: {
    maxDuration: 15,
    uploadMode: "multi-file",
    showDraftMode: true,
    supportAudio: true,
  },
  promptSectionProps: { showAiAssist: false },
};
```

จุดสำคัญ:

- **`model` ต้องเป็น `state.selectedAIModel?.modelType`** ไม่ใช่ `sendConfig.type`
  backend ค้นด้วยคู่ `(modelType, type)`
- **`buildSubmitPayload` ต้อง pure** — ห้ามเรียก API / setState เพราะถูกเรียก 2 ครั้ง
  (ครั้งแรกเพื่อประเมินเครดิตผ่าน `getCreditPreSend`)
- **`features.uploadMode` มีผลจริง** ต่อ orchestrator:
  `"first-last"` เติม `refImageFirst`/`refImageLast` — `"multi-file"` เติม `refImages` + `computedFiles`
  ต้องตรงกับสิ่งที่ builder ฝั่ง worker คาดหวัง
- ค่าที่โมเดลไม่ใช้ให้ใส่ค่ากลาง ๆ (`image: []`, `maxImages: 0`) ไม่ใช่ `undefined`
  เพราะ DTO ฝั่ง backend ประกาศเป็น required

---

## Step 2 — สร้างฟอร์ม

ไฟล์: `.../version/seedance3/chat-video-input.tsx`

**วิธีที่เร็วและปลอดภัยที่สุดคือ copy จาก version ที่ใกล้ที่สุด** แล้วตัดสิ่งที่ไม่ใช้ออก
(`version/seedance2/chat-video-input.tsx` เป็นตัวที่ครบที่สุด)

ข้อบังคับของ component:

1. รับ props ครบตาม `VideoInputProps` (ประกาศใน `chat-generate-video.tsx`)
   — orchestrator ส่งมาทั้งชุด ไม่รับก็ไม่ error แต่จะใช้ค่าไม่ได้
2. `export default` เป็น function component
3. ฟอร์มคือ antd `<Form form={form} onFinish={handleSendMessage}>` — **ต้องเรียก `handleSendMessage`
   ผ่าน `onFinish`** ไม่ใช่ handler เอง ไม่งั้น validation ไม่ทำงาน
4. field prompt ต้องชื่อ `prompt` เพราะ `buildSubmitPayload` อ่าน `values.prompt`

ประกอบจาก shared section:

```tsx
<Form form={form} onFinish={handleSendMessage} layout="vertical">
  <PromptSection {...} />               {/* video: import ตัว local ถ้าต้องการ @mentions */}
  <UploadSection {...} />               {/* video ใช้ ../../shared/upload-section */}
  <SettingSection
    showRatioSection
    showResolutionSection
    resolutionOptions={["480p", "720p", "1080p"]}
    ratioOptions={...}
    extraContent={
      <>
        {/* control เฉพาะโมเดล: duration slider / audio toggle / draft mode */}
      </>
    }
  />
  <PromptTemplateSection {...} />
  <BrandKitSection {...} />
</Form>
```

`SettingSection.extraContent` คือช่องเสียบ control เฉพาะโมเดล
— **อย่าไปแก้ `setting-section.tsx`** เพื่อรองรับโมเดลเดียว

> **ระวัง:** tab video มี `prompt-section.tsx` ของตัวเองในโฟลเดอร์ version (มี `mentionOptions`
> `@image1`, `@video1`) ที่ตัว shared ไม่มี ถ้าต้องการ mention ให้ copy ไฟล์นั้นมาไว้ในโฟลเดอร์ใหม่ด้วย

ถ้ามี ratio → size map ให้วางไว้ในไฟล์ฟอร์มเหมือนที่ `seedance2` ทำ (`RATIO_SIZE_MAP`)
แล้วเรียก `setSelectedWidth` / `setSelectedHeight` ตอนผู้ใช้เปลี่ยน ratio

---

## Step 3 — ลงทะเบียน (จุดที่พลาดบ่อยที่สุด)

### image / video — ต้องลง **2 ที่**

`app/page/project/[id]/components/tab-layout/model-registry.ts`

```ts
import { seeda3Config } from "../tabs/video-gen/version/seedance3/config";

const videoConfigByType: Readonly<Record<string, VideoModelConfig>> = {
  seedance1: seeda1Config,
  seedance2: seeda2Config,
  seedance3: seeda3Config,      // ← เพิ่ม
};
```

`app/page/project/[id]/components/tabs/video-gen/video-form-renderer.tsx`

```ts
import Seeda3Input from "./version/seedance3/chat-video-input";

const formComponentByType: Record<string, FC<VideoInputProps>> = {
  seedance1: Seeda1Input as FC<VideoInputProps>,
  seedance2: Seeda2Input as FC<VideoInputProps>,
  seedance3: Seeda3Input as FC<VideoInputProps>,   // ← เพิ่ม
};
```

ที่แยก 2 ที่เพราะ `model-registry.ts` ต้องไม่ import React component — **Workflow ใช้ config ซ้ำ**
โดยไม่แตะฟอร์ม (`workflow-edit-form.tsx` อ่าน `features` แล้วเรนเดอร์ฟอร์ม generic เอง)
ผลคือลงทะเบียนใน `model-registry.ts` แล้วโมเดลใหม่ใช้ใน Workflow ได้ทันทีโดยไม่ต้องเขียนเพิ่ม

### omnihumen / dreamactor — ลง **ที่เดียว**

`tabs/omni-human/omnihumen-form-renderer.tsx` (หรือ `tabs/dream-actor/dreamactor-form-renderer.tsx`)

```ts
const omniModelRegistry: Record<
  string,
  { config: OmniModelConfig; FormComponent: FC<OmniInputProps> }
> = {
  omnihuman: { config: omih1Config, FormComponent: ChatOmnihumenInput as FC<OmniInputProps> },
  omnihuman2: { config: omih2Config, FormComponent: Omih2Input as FC<OmniInputProps> },  // ← เพิ่ม
};
```

สอง tab นี้ไม่ได้ต่อกับ `model-registry.ts` จึงใช้ใน Workflow ไม่ได้

> **ลืมลงทะเบียนที่ใดที่หนึ่ง = เลือกโมเดลแล้วจอว่างเปล่า ไม่มี error ใน console**
> เพราะ renderer เขียนไว้ว่า `if (!config || !FormComponent) return <></>;`
> เจออาการนี้ให้เช็คตรงนี้ก่อนเสมอ

---

## Step 4 — แก้ contract (เฉพาะเมื่อจำเป็น)

`tab-layout/types/generator-config.type.ts` — แก้ต่อเมื่อ:

- payload ต้องมี field ที่ `VideoGeneratePayload` ยังไม่มี
- ต้องมี feature flag ใหม่ใน `VideoModelFeatures`

**field ใหม่ต้องเป็น optional** เพราะ config ของโมเดลเดิมทุกตัวใช้ interface เดียวกัน

ถ้าเพิ่ม field ใน payload → **ต้องเพิ่มใน DTO ฝั่ง backend ด้วย**
(`ai-media-backend/libs/share/src/types/video-generate.ts`) ไม่งั้น backend รับมาแล้วทิ้งเงียบ ๆ

ถ้าใช้ field ที่มีอยู่แล้วได้ → ข้ามขั้นนี้

---

## Step 5 — แก้ orchestrator (เฉพาะเมื่อต้องมี state ใหม่)

`tabs/video-gen/chat-generate-video.tsx` (~1,200 บรรทัด — orchestrator ที่ถือ state ทั้งหมด)

แก้ต่อเมื่อโมเดลต้องการ state ที่ยังไม่มี เช่น selector ใหม่ หรือ upload mode ใหม่

**ต้องแก้พร้อมกันครบ 4 จุด** ลืมจุดใดจุดหนึ่ง = ค่าไม่ถึง `buildSubmitPayload`:

1. `VideoFormState` ใน `generator-config.type.ts` — เพิ่ม field
2. `useState` ใน orchestrator
3. `buildCurrentState()` — ใส่ field ใหม่ลงใน object ที่ return
4. `VideoInputProps` + จุด render `<FormComponent ... />` — ส่ง value + setter ลงไปที่ฟอร์ม

ถ้าโมเดลใหม่ใช้ state ที่มีอยู่แล้วได้ทั้งหมด → **ข้ามขั้นนี้** อย่าแตะ orchestrator โดยไม่จำเป็น
มันเป็นไฟล์ที่ทุกโมเดลใช้ร่วมกัน

---

## Step 6 — Workflow (ถ้าต้องการ)

`tabs/workflow/workflow-edit-form.tsx` อ่าน `features.uploadMode / maxDuration / supportAudio / showDraftMode`
แล้วเรนเดอร์ฟอร์ม generic ให้เอง — **ปกติไม่ต้องแก้**

แก้ต่อเมื่อโมเดลใหม่มี control ที่ workflow ยังไม่รู้จัก หรือมี ratio map ใหม่
(ระวัง: `IMAGE_RATIO_SIZE_MAP` / `VIDEO_RATIO_SIZE_MAP` ในไฟล์นี้เป็นสำเนาแยกจากใน version form)

---

## Step 7 — Verify

```bash
cd ai-media-frontend

npx tsc --noEmit
yarn lint
yarn build

# ต้องเจอ 2 จุดสำหรับ image/video (registry + renderer), 1 จุดสำหรับ omni/dream
grep -rn "seedance3" "app/page/project/[id]/components" --include=*.ts --include=*.tsx
```

**End-to-end**

1. ให้ backend มี row ที่ `isActive: true` และ `sendConfig.type = "seedance3"` แล้ว
2. `yarn dev` → เปิด project → tab video
3. เปิด dropdown เลือกโมเดลใหม่ → **ต้องเห็นฟอร์มใหม่ ไม่ใช่จอว่าง**
   (จอว่าง = Step 3 ไม่ครบ)
4. กรอกฟอร์ม → ดูตัวเลขเครดิตขึ้นถูกต้อง (มาจาก `getCreditPreSend` ที่ใช้ payload ตัวเดียวกัน)
5. กด generate → ดู payload ที่ `socket.emit` ใน Network/DevTools ว่าตรงกับที่ตั้งใจ
6. ผลลัพธ์ขึ้นใน gallery
7. รีเฟรชหน้า → โมเดลที่เลือกต้องยังเป็นตัวเดิม (จาก localStorage `selectedAIModel_video_${projectId}`)
8. เปิด Workflow tab → โมเดลใหม่ควรอยู่ใน `modelsByType` และเลือกได้ (image/video เท่านั้น)

---

## Checklist

- [ ] backend เสร็จแล้วและ row มี `isActive: true`
- [ ] `config.ts` — `model` ใช้ `modelType`, builder เป็น pure function, `features.uploadMode` ตรงกับ worker
- [ ] `chat-<domain>-input.tsx` — `onFinish={handleSendMessage}`, field ชื่อ `prompt`
- [ ] ลงทะเบียนครบ (image/video = 2 ที่, omni/dream = 1 ที่)
- [ ] contract type แก้เฉพาะที่จำเป็น และ field ใหม่เป็น optional
- [ ] ถ้าเพิ่ม payload field → เพิ่มใน DTO backend ด้วย
- [ ] ถ้าเพิ่ม state → แก้ครบ 4 จุด
- [ ] `tsc --noEmit` + `lint` + `build` ผ่าน
- [ ] เลือกโมเดลใหม่แล้วเห็นฟอร์ม (ไม่ใช่จอว่าง) และ generate สำเร็จจริง
