# REFERENCE — contract และกับดัก (Frontend)

เอกสารอ้างอิง ไม่ใช่ขั้นตอน ถ้าต้องการขั้นตอนดู [MANUAL.md](./MANUAL.md)

---

## 1. ทุกอย่างผูกด้วย `selectedAIModel.sendConfig.type`

`TMasterModelType` มาจาก API `GET /master-model-type` — ดู
[`app/common/master-model-type.type.ts`](../../app/common/master-model-type.type.ts)

```ts
type TMasterModelType = {
  id: number;
  name?: string;
  modelType?: string;      // provider model id → ส่งเป็น payload.model
  type?: string;           // image | video | omnihumen | dreamactor → ใช้กรอง tab
  description?: string;    // text-to-video ฯลฯ
  isDefault?: boolean;
  modelDetails?: any;      // pricing / limitations ที่โชว์ใน dropdown
  sendConfig?: { type: string };   // ← คีย์ registry
};
```

`sendConfig.type` เป็นคีย์ที่ใช้ค้นทั้ง **config** และ **form component**

---

## 2. Pipeline ต่อ 1 tab

```
page.tsx
  · fetch masterModelTypeServices.findAll()
  · filter aiModels ด้วย m.type === activeKey
  · resolveModel(aiModels, key, projectId)
       ลำดับ: localStorage `selectedAIModel_${tabKey}_${projectId}`
              → isDefault && type === tabKey
              → ตัวแรกที่ type === tabKey
  │
  └─ <XFormRenderer selectedAIModel={...} />
        · type   = selectedAIModel?.sendConfig?.type || ""
        · config = getXModelConfig(selectedAIModel)      ← model-registry.ts
        · Form   = formComponentByType[type]             ← ในไฟล์ renderer เอง
        · ถ้าขาดอย่างใดอย่างหนึ่ง → return <></> (จอว่าง ไม่มี error)
        │
        └─ <ChatGenerateX modelConfig={config} FormComponent={Form} />
              · ถือ state ทั้งหมด, upload, socket, history
              · buildCurrentState() → XFormState
              · modelConfig.buildSubmitPayload(values, state, tempTaskId)
              · socket.emit("generate:video", payload)
              │
              └─ <generate-two-pane-layout leftPanel={<FormComponent {...props} />} />
```

> **จอว่างเปล่าตอนเลือกโมเดล = ลงทะเบียนไม่ครบ** — renderer คืน `<></>` เงียบ ๆ ไม่ throw

---

## 3. Registry — ลงทะเบียนกี่ที่ ขึ้นกับ tab

| Tab | config ลงที่ | form component ลงที่ | จำนวนจุดที่ต้องแก้ |
|---|---|---|---|
| image | `tab-layout/model-registry.ts` → `imageConfigByType` | `tabs/image-gen/image-form-renderer.tsx` → `formComponentByType` | **2** |
| video | `tab-layout/model-registry.ts` → `videoConfigByType` | `tabs/video-gen/video-form-renderer.tsx` → `formComponentByType` | **2** |
| omnihumen | `tabs/omni-human/omnihumen-form-renderer.tsx` → `omniModelRegistry` | ที่เดียวกัน | **1** |
| dreamactor | `tabs/dream-actor/dreamactor-form-renderer.tsx` → `dreamactorModelRegistry` | ที่เดียวกัน | **1** |

image/video แยก config ออกมาที่ [`model-registry.ts`](../../app/page/project/%5Bid%5D/components/tab-layout/model-registry.ts)
เพราะ **workflow ใช้ config ซ้ำ** โดยไม่ import React component
(`workflow-edit-form.tsx` อ่าน `features.uploadMode / maxDuration / supportAudio / showDraftMode`)

ผลพลอยได้: โมเดล video ที่ลงทะเบียนใน `model-registry.ts` แล้ว **ใช้งานใน Workflow ได้ทันที**
โดยไม่ต้องเขียนโค้ดเพิ่ม (workflow เรนเดอร์ฟอร์ม generic ไม่ใช่ version component ของคุณ)

---

## 4. Contract ใน `generator-config.type.ts`

[`tab-layout/types/generator-config.type.ts`](../../app/page/project/%5Bid%5D/components/tab-layout/types/generator-config.type.ts)
มี trio ต่อ 1 โดเมน: `XFormState` (input ของ builder) / `XGeneratePayload` (output) / `XModelConfig` (สัญญา)

```ts
export interface VideoModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,   // ค่าจาก antd Form (มี prompt เป็นหลัก)
    state: VideoFormState,             // state จาก orchestrator
    tempTaskId: string,
  ) => VideoGeneratePayload;
  features?: VideoModelFeatures;
  promptSectionProps?: { showAiAssist?: boolean };
}
```

### `XFormState` — มีอะไรให้ใช้บ้าง

| โดเมน | field เด่น |
|---|---|
| **Video** | `refImageFirst` / `refImageLast` (first-last mode), `refImages` + `computedFiles` (multi-file mode), `selectedResolution`, `selectedRatio`, `selectedWidth/Height`, `selectedDuration`, `selectedAudio`, `draftMode` |
| **Image** | `refImages`, `selectedResolution`, `selectedRatio`, `selectedWidth/Height`, `selectedMaximumImage`, `groupMode` |
| **Omni** | `refImageFirst` = ภาพ portrait, `refImageLast` = ไฟล์เสียง, `selectedDuration`, `fastMode` |
| **Dreamactor** | `refImageFirst` = ภาพ portrait, `refImageLast` = วิดีโอ drive, `fastMode` |

ทุกโดเมนมีร่วมกัน: `selectedAIModel`, `projectId`, `userId`, `organizationId`, `username`

```ts
interface RefImage { name; status; uid; url; imagePath: string }
interface ComputedFileRef { type: string; url: string }
```

### `features` — ธงที่ orchestrator และ workflow อ่าน

| โดเมน | flags |
|---|---|
| Video | `maxDuration`, `uploadMode: "first-last" \| "multi-file"`, `showDraftMode`, `supportAudio` |
| Image | `maxImages`, `supportReferenceImage` |
| Omni | `supportAudio`, `showSeed`, `resolutionOptions` |
| Dreamactor | `showSeed`, `resolutionOptions`, `maxDuration` |

`uploadMode` มีผลจริงกับ orchestrator: `"first-last"` เติม `refImageFirst`/`refImageLast`,
`"multi-file"` เติม `refImages` + `computedFiles`

---

## 5. Naming convention

| ของ | รูปแบบ | ตัวอย่าง (seedance2) |
|---|---|---|
| โฟลเดอร์ | `tabs/<tab>/version/<sendConfig.type>/` | `tabs/video-gen/version/seedance2/` |
| config export | `<4 ตัวแรกแบบย่อ><เลขรุ่น>Config` | `seeda2Config` |
| ไฟล์ config | `config.ts` | |
| ไฟล์ฟอร์ม | `chat-<domain>-input.tsx` | `chat-video-input.tsx` |
| import alias ใน renderer | `<Pascal>Input` | `Seeda2Input` |

ตัวย่อที่ใช้อยู่: `seedream1 → seedr1`, `seedream2 → seedr2`, `seedance1 → seeda1`, `seedance2 → seeda2`,
`omnihuman → omih1`, `dreamactor → dreac1`

---

## 6. Shared section components

[`tab-layout/generate-section/`](../../app/page/project/%5Bid%5D/components/tab-layout/generate-section/)

| ไฟล์ | หน้าที่ | props ที่ใช้บ่อย |
|---|---|---|
| `prompt-section.tsx` | textarea + AI Assist modal | `fieldName`, `title`, `placeholder`, `maxLength`, `rows`, `showAiAssist`, `required`, `generateType` |
| `upload-section.tsx` | tile อัปโหลดหลายไฟล์ | `maxUploadFiles`, `accept`, `extraActions` |
| `setting-section.tsx` | พาเนล parameter รวม | `showModeSection`, `showRatioSection`, `showResolutionSection`, `showCountSection`, `resolutionOptions`, `ratioOptions`, `countControl`, **`extraContent`** |
| `prompt-template-section.tsx` | template ที่บันทึกไว้ | |
| `brand-kit-section.tsx` | brand kit | |
| `browse-prompt-modal.tsx` | modal เลือก prompt | |

**`setting-section.extraContent`** คือช่องเสียบ control เฉพาะโมเดล
(duration slider, audio toggle, draft mode ของ seedance ทั้งหมดอยู่ในนี้)
— ถ้าจะเพิ่ม control ใหม่ ให้เสียบตรงนี้ ไม่ต้องแก้ `setting-section.tsx`

---

## 7. Known divergences ⚠️

สิ่งที่ไม่สม่ำเสมออยู่แล้วในโค้ดเบส ต้องรู้ก่อนจะ copy pattern ผิดตัว

1. **video มี `prompt-section.tsx` ของตัวเอง**
   `version/seedance1/prompt-section.tsx` และ `version/seedance2/prompt-section.tsx`
   เพิ่ม `mentionOptions` (`@image1`, `@video1`) ที่ตัว shared ไม่มี
   → โมเดล video ใหม่ที่ต้องการ mention ให้ copy ไฟล์ local มาด้วย
2. **video ใช้ `tabs/video-gen/shared/upload-section.tsx`** ไม่ใช่ตัวใน `tab-layout/generate-section/`
3. **`RATIO_SIZE_MAP` ซ้ำหลายที่** — ในแต่ละ version form และอีกชุดใน `workflow-edit-form.tsx`
   (`IMAGE_RATIO_SIZE_MAP` / `VIDEO_RATIO_SIZE_MAP`) แก้ที่เดียวไม่พอ
4. **มีสองคำสะกดที่ตั้งใจให้ต่างกัน** — `GenerateTabKey` และ `master_model_type.type` ใช้ `"omnihumen"`
   (สะกดผิดตามข้อมูลใน DB) ส่วน [`app/common/generation-type.ts`](../../app/common/generation-type.ts)
   ประกาศ `"omnihuman"` เป็น canonical key สำหรับ label / สี / chart โดย backend normalize ให้ก่อนส่งออก API
   → **ใช้ `omnihumen` เวลาคุยกับ tab/registry/DB และ `omnihuman` เวลาคุยกับ `generation-type.ts`**
5. **JSDoc ใน `omnihumen-form-renderer.tsx` / `dreamactor-form-renderer.tsx` stale** —
   เขียนว่า key คือ `selectedAIModel.description` แต่โค้ดจริงใช้ `sendConfig.type`
6. **omni/dream ไม่ได้ต่อกับ `model-registry.ts`** → ใช้ใน Workflow ไม่ได้
7. **`getCreditPreSend` ใช้ payload ตัวเดียวกับตอน submit** — `buildSubmitPayload` ถูกเรียก 2 ครั้ง
   (ครั้งแรกเพื่อประเมินเครดิต) ต้องไม่มี side effect ในนั้น

---

## 8. Gotchas

1. **image/video ต้องลงทะเบียน 2 ที่** ลืมที่ใดที่หนึ่ง → เลือกโมเดลแล้วจอว่าง ไม่มี error ใน console
2. **`buildSubmitPayload` ต้องเป็น pure function** — ห้ามเรียก API / setState
3. **เพิ่ม field ใน `XGeneratePayload` ต้องเพิ่มใน DTO ฝั่ง backend ด้วย**
   (`ai-media-backend/libs/share/src/types/<type>-generate.ts`) ไม่งั้น backend จะทิ้งค่าเงียบ ๆ
4. **เพิ่ม state ใหม่ใน orchestrator ต้องแก้พร้อมกัน 4 จุด** — `XFormState`, `buildCurrentState()`,
   `XInputProps`, และจุด render `<FormComponent .../>` ลืมจุดใดจุดหนึ่ง = ค่าไม่ถึง builder
5. **`model.modelDetails` เป็น `any`** — เข้าถึงด้วย optional chaining เสมอ ค่าใน DB ไม่ได้การันตีรูปร่าง
6. **payload ต้องมี `model: state.selectedAIModel?.modelType`** ไม่ใช่ `sendConfig.type` —
   backend ค้นด้วยคู่ `(modelType, type)`

---

## 9. อ้างอิงข้าม repo

ฝั่ง backend มีเอกสารชุดคู่กันที่ `ai-media-backend/docs/add-model/`
row ใน `master_model_type` และ payload builder ที่ worker ต้องทำก่อน ไม่งั้นกด generate แล้วจะ error
