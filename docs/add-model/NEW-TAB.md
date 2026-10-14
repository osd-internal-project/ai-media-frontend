# NEW-TAB — เพิ่ม generation type ใหม่ทั้งหมด (Frontend, Case C)

> ⚠️ **งานใหญ่ ไม่ใช่งานที่ปล่อยให้ AI ทำจบเองแล้วเมิร์จ**
> เอกสารนี้เป็นแผนที่ ไม่ใช่สคริปต์ ต้องมีคนรีวิวทุกไฟล์
> ถ้าโมเดลใหม่เข้ากับ 4 tab ที่มีอยู่ได้ **อย่าใช้เอกสารนี้** ให้ใช้ [MANUAL.md](./MANUAL.md)

ทำ backend ให้เสร็จก่อน (`ai-media-backend/docs/add-model/NEW-TAB.md`)
แล้วทดสอบ socket event ด้วย client ธรรมดาก่อนจะเริ่มทำ UI

ตัวอย่างสมมติในเอกสารนี้: tab ใหม่ชื่อ `audio`

---

## ภาพรวม — 3 ก้อน

1. **ก้อน tab** — ทำให้ tab โผล่ใน `page.tsx` และเลือกโมเดลได้
2. **ก้อน generator** — contract + orchestrator + renderer + form component
3. **ก้อน union ที่ต้องไล่แก้** — `activeKey` กระจายอยู่ใน 10 ไฟล์

---

## ก้อนที่ 1 — Tab

### 1.1 `app/page/project/[id]/page.tsx`

ไฟล์เดียวที่ tab ทั้งหมดอยู่ ต้องแก้ 5 จุด:

```ts
// 1. union
type GenerateTabKey =
  | "image" | "video" | "omnihumen" | "dreamactor"
  | "audio"                                         // ← เพิ่ม
  | "workflow" | "library" | "activity" | "editor" | "social";

// 2. สี icon
const tabIconColorByType = useMemo<Record<GenerateTabKey, string>>(() => ({
  ...,
  audio: semantic.colorInfo || "#13c2c2",           // ← เพิ่ม (Record บังคับให้ครบทุก key)
}), [semantic]);

// 3. access gate — ต่อจาก canAccessImage / canAccessVideo / ...
canAccessAudio: !has || normalizedAccessCodes.some((c) => c.includes("audio")),

// 4. item ใน <Tabs items={[...]}> — gate ด้วย canAccessAudio แล้วเรนเดอร์ <AudioFormRenderer />

// 5. resolveModel ใช้ได้เลย ไม่ต้องแก้ (generic อยู่แล้ว)
//    แต่ต้องมั่นใจว่า master_model_type.type === "audio" ตรงกับ tab key
```

> `tabIconColorByType` เป็น `Record<GenerateTabKey, string>` → ลืมเพิ่มแล้ว `tsc` จะฟ้องให้เอง

### 1.2 `app/page/project/[id]/components/header-generate-image.tsx`

`<Select>` ของโมเดล — เพิ่ม `"audio"` ใน union ของ prop `activeKey`
ตัว dropdown เองเรนเดอร์จาก `modelDetails` / `capabilities` แบบ generic ไม่ต้องแก้เพิ่ม

### 1.3 `app/common/generation-type.ts`

เพิ่ม `"audio"` ใน `GENERATION_TYPE_KEYS`, `GENERATION_TYPE_LABEL`, `generationTypeColors`

> ระวังคำสะกด: ไฟล์นี้ใช้ canonical key (`omnihuman`) ส่วน tab key ใช้ค่าที่อยู่ใน DB (`omnihumen`)
> ถ้า tab ใหม่ตั้งชื่อให้ตรงกันทั้งสองที่ตั้งแต่แรก จะไม่เจอปัญหานี้ — **ตั้งให้ตรงกัน**

---

## ก้อนที่ 2 — Generator

### 2.1 Contract — `tab-layout/types/generator-config.type.ts`

เพิ่ม trio ใหม่ตามแบบของ Video:

```ts
export interface AudioFormState {
  selectedAIModel: (TMasterModelType & { capabilities?: string[] }) | undefined;
  // ← state ที่ฟอร์มต้องใช้
  projectId: string;
  userId: string;
  organizationId: string | undefined;
  username: string;
}

export interface AudioGeneratePayload {
  taskId: string;
  model: string | undefined;
  prompt: string;
  projectId: string;
  userId: string | undefined;
  typeGenerate: string;
  organizationId: string | undefined;
  // ← field เฉพาะ audio
}

export interface AudioModelFeatures { /* flags */ }

export interface AudioModelConfig {
  buildSubmitPayload: (
    values: Record<string, unknown>,
    state: AudioFormState,
    tempTaskId: string,
  ) => AudioGeneratePayload;
  features?: AudioModelFeatures;
}
```

`AudioGeneratePayload` ต้องตรงกับ `RequestAudioGenerateDto` ฝั่ง backend **ทีละ field**

### 2.2 Orchestrator — `tabs/audio-gen/chat-generate-audio.tsx`

ก้อนใหญ่ที่สุด copy โครงจาก `chat-generate-video.tsx` (~1,200 บรรทัด) แล้วตัดสิ่งที่ไม่ใช้

ต้องมีครบ:

- `export interface AudioInputProps` — props ทั้งหมดที่ส่งให้ form component
- state ของ form (ratio / resolution / duration / ฯลฯ ตามที่ audio ต้องการ)
- upload handling + progress
- `buildCurrentState(): AudioFormState`
- credit preview: `modelConfig.buildSubmitPayload(...)` → `generateServices.getCreditPreSend(payload)`
- socket: `socket.emit("generate:audio", payload)` + listener ของ
  `audio-task:created` / `task-audio:started` / `worker:audio-*` / `audio-generate:error`
  (ชื่อ event ต้องตรงกับที่ backend emit — เช็คใน `websocket.gateway.ts`)
- โหลด history + infinite scroll
- เรนเดอร์ผ่าน `generate-two-pane-layout.tsx` โดยส่ง `FormComponent` เป็น `leftPanel`

### 2.3 Renderer — `tabs/audio-gen/audio-form-renderer.tsx`

```tsx
const formComponentByType: Record<string, FC<AudioInputProps>> = {
  "<send_config_type>": AudioInput as FC<AudioInputProps>,
};

const AudioFormRenderer: FC<AudioChatProps> = (props) => {
  const type = props.selectedAIModel?.sendConfig?.type || "";
  const config = getAudioModelConfig(props.selectedAIModel);
  const FormComponent = formComponentByType[type];
  if (!config || !FormComponent) return <></>;
  return <ChatGenerateAudio {...props} modelConfig={config} FormComponent={FormComponent} />;
};
```

### 2.4 Registry — `tab-layout/model-registry.ts`

เพิ่ม `audioConfigByType` + `getAudioModelConfig()` ตามแบบ image/video

> ทำแบบ image/video (config แยกจาก component) **ไม่ใช่แบบ omni/dream** —
> เพราะแบบแยกทำให้ Workflow ใช้โมเดลใหม่ได้ และเป็นทิศทางที่โค้ดเบสกำลังไป

### 2.5 Version — `tabs/audio-gen/version/<slug>/{config.ts, chat-audio-input.tsx}`

ตามขั้นตอนใน [MANUAL.md](./MANUAL.md) Step 1–2 ปกติ

### 2.6 ผลลัพธ์ — `tabs/audio-gen/shared/`

component สำหรับแสดงผลลัพธ์ในแชท (player / thumbnail / download / ปุ่ม action)
ไม่มีของเดิมให้ copy ตรง ๆ เพราะ audio ไม่ใช่ media แบบเดียวกับ image/video

---

## ก้อนที่ 3 — union `activeKey` ที่ต้องไล่แก้

`activeKey` ถูกประกาศเป็น union ซ้ำในหลายไฟล์ (ไม่ได้ share type กัน) ต้องเพิ่ม `"audio"` ให้ครบ:

```
app/page/project/[id]/components/header-generate-image.tsx
app/page/project/[id]/components/tabs/image-gen/chat-generate-image.tsx
app/page/project/[id]/components/tabs/video-gen/video-form-renderer.tsx
app/page/project/[id]/components/tabs/video-gen/chat-generate-video.tsx
app/page/project/[id]/components/tabs/omni-human/chat-generate-omnihumen.tsx
app/page/project/[id]/components/tabs/dream-actor/chat-generate-dreamactor.tsx
app/page/project/[id]/components/tabs/workflow/workflow-form-renderer.tsx
app/page/project/[id]/components/tabs/library/prompt-library.tsx
app/page/project/[id]/components/tabs/all-activity/prompt-activity.tsx
app/page/project/[id]/components/tabs/public-social/public-social.tsx
```

หาให้ครบด้วย:

```bash
grep -rn "activeKey" "app/page/project/[id]/components" --include=*.tsx | grep -n '"omnihumen"'
```

> **Suggestion:** ควรรวม union นี้เป็น type เดียวใน `app/common/` แล้วให้ทุกไฟล์ import
> จะได้ไม่ต้องไล่แก้ 10 ที่ทุกครั้ง — say the word and I'll refactor.

---

## ที่อื่นที่อาจต้องแตะ

| ไฟล์ | เมื่อไหร่ |
|---|---|
| `tabs/workflow/workflow-canvas.tsx` (`modelsByType`) | ถ้าอยากให้ audio ใช้ใน Workflow ได้ |
| `tabs/workflow/workflow-edit-form.tsx` | ฟอร์ม generic ของ workflow ต้องรู้จัก control ของ audio |
| `app/page/settings/template-new/page.tsx` | ถ้า template รองรับ type ใหม่ |
| `app/page/admin-management/model-pricing/page.tsx` | dropdown `type` ในหน้า admin |
| `app/page/project/component/quata.tsx` | ถ้าการแสดงเครดิตต่างออกไป |

---

## Checklist Frontend

- [ ] backend เสร็จ + socket event ทดสอบผ่านแล้ว
- [ ] `page.tsx` — union, `tabIconColorByType`, access gate, `<Tabs items>`
- [ ] `header-generate-image.tsx` — union `activeKey`
- [ ] `generation-type.ts` — key / label / color (ตั้งชื่อให้ตรงกับ tab key)
- [ ] contract trio ใน `generator-config.type.ts` ตรงกับ DTO backend ทุก field
- [ ] orchestrator ครบ: state, upload, credit preview, socket, history
- [ ] renderer + `model-registry.ts` (`audioConfigByType` + `getAudioModelConfig`)
- [ ] version `config.ts` + form component
- [ ] shared result component
- [ ] `activeKey` union ครบทั้ง 10 ไฟล์
- [ ] `npx tsc --noEmit` + `yarn lint` + `yarn build` ผ่าน
- [ ] generate จริงจากต้นจนไฟล์ขึ้น gallery, เครดิตถูกหัก, error path (job fail) แสดงผลถูกต้อง
- [ ] รีเฟรชแล้วโมเดลที่เลือกยังคงเดิม, สลับ tab ไปมาไม่พัง
