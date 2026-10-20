import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Clapperboard,
  CreditCard,
  Download,
  FolderOpen,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Mic,
  PenLine,
  Play,
  Presentation,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Table,
  Users,
} from "lucide-react";
import {
  ActivityMockup,
  GenerateMockup,
  LibraryMockup,
  ProjectListMockup,
  VideoEditorMockup,
} from "./guide-mockups";

export type GuideStep = {
  id: string;
  selector: string;
  icon: LucideIcon;
  title: string;
  description: string;
  example?: string;
  tip?: string;
  /** Renders the list of tabs the user can actually see. */
  tabList?: boolean;
};

export type GuideMockupProps = {
  stepIds: string[];
  marker: (stepId: string) => ReactNode;
};

export type GuideContent = {
  title: string;
  intro: string;
  steps: GuideStep[];
  mockup: ComponentType<GuideMockupProps>;
};

const tour = (id: string) => `[data-tour="${id}"]`;

export const PROJECT_LIST_GUIDE: GuideContent = {
  title: "เริ่มต้นใช้งาน",
  intro: "เลือก project เพื่อเข้าหน้าทำงาน แล้วเลือก tab ตามสิ่งที่ต้องการสร้าง",
  mockup: ProjectListMockup,
  steps: [
    {
      id: "sider-menu",
      selector: tour("sider-menu"),
      icon: FolderOpen,
      title: "เมนูหลัก",
      description: "เมนู Projects พาคุณกลับมาที่รายการ project ได้ทุกเมื่อ",
      tip: "เมนูที่เห็นขึ้นอยู่กับสิทธิ์ของคุณใน organization",
    },
    {
      id: "org-switcher",
      selector: tour("org-switcher"),
      icon: Home,
      title: "เลือก Organization",
      description: "ถ้าคุณอยู่หลายทีม กดตรงนี้เพื่อสลับ organization รายการ project จะเปลี่ยนตามทีมที่เลือก",
    },
    {
      id: "project-filter",
      selector: ".project-filter-row",
      icon: Search,
      title: "ค้นหาและกรอง project",
      description: "พิมพ์ชื่อแล้วกด Enter เพื่อค้นหา หรือกด All / Active / Inactive เพื่อกรองตามสถานะ",
    },
    {
      id: "project-view",
      selector: ".project-view-toggle",
      icon: LayoutGrid,
      title: "สลับมุมมอง",
      description: "เลือกดูแบบรายการหรือแบบการ์ด",
    },
    {
      id: "project-card",
      selector: ".project-grid-card, .project-main-scroll .ant-table-row",
      icon: ArrowRight,
      title: "กดที่ project เพื่อเข้าหน้าทำงาน",
      description:
        "หน้าทำงานคือที่สร้างภาพ วิดีโอ และเสียง การ์ดบอกเครดิตที่ project ใช้ไป จำนวนสมาชิก และวันที่สร้าง",
      tip: "ถ้ายังไม่เห็น project ให้ติดต่อผู้ดูแล organization เพื่อเพิ่มคุณเป็นสมาชิก",
    },
  ],
};

/** One-line Thai description per tab key rendered by app/page/project/[id]/page.tsx. */
export const TAB_DESC: Record<string, string> = {
  image: "สร้างภาพจากข้อความหรือรูปอ้างอิง",
  video: "สร้างวิดีโอจากข้อความ รูป หรือคลิปอ้างอิง",
  omnihumen: "ทำให้รูปคนพูดตามเสียงที่ใส่",
  dreamactor: "ทำให้ตัวละครขยับตามวิดีโอต้นแบบ",
  audio: "สร้างเสียงพูด เพลง หรือเสียงประกอบ",
  workflow: "ต่อขั้นตอนการสร้างหลายขั้นบน canvas",
  library: "ผลงานที่บันทึกเก็บไว้ใน project",
  activity: "ประวัติการสร้างทั้งหมดใน project",
  editor: "แก้ไขและตกแต่งภาพ",
  "video-editor": "นำคลิปที่สร้างไว้มาตัดต่อเป็นวิดีโอเดียว",
  social: "แชร์ผลงานสู่ social",
};

const HEAD_STEPS: GuideStep[] = [
  {
    id: "view-switch",
    selector: tour("view-switch"),
    icon: Users,
    title: "มุมมอง Team / Personal",
    description: "Team แสดงงานของทุกคนใน project ส่วน Personal แสดงเฉพาะงานของคุณ",
  },
  {
    id: "tabs",
    selector: ".generate-tabs > .ant-tabs-nav",
    icon: Layers,
    title: "เลือกเครื่องมือจาก tab",
    description: "แต่ละ tab คือเครื่องมือหนึ่งอย่าง คุณใช้ได้ tab ต่อไปนี้",
    tabList: true,
  },
];

const modelStep = (description: string, tip?: string): GuideStep => ({
  id: "model",
  selector: tour("model"),
  icon: Sparkles,
  title: "เลือก AI Model",
  description,
  tip,
});
const templateStep: GuideStep = {
  id: "template",
  selector: tour("template"),
  icon: Presentation,
  title: "Browse Prompt Templates",
  description: "ยังไม่รู้จะเขียนอะไร เลือก prompt สำเร็จรูปที่ทีมเตรียมไว้ แล้วแก้ต่อได้",
};
const brandStep: GuideStep = {
  id: "brand",
  selector: tour("brand"),
  icon: Lightbulb,
  title: "Brand Kit",
  description: "เปิดสวิตช์เพื่อให้ผลงานใช้สีและสไตล์ของแบรนด์ที่ทีมตั้งไว้",
};
const quotaStep: GuideStep = {
  id: "quota",
  selector: tour("quota"),
  icon: CreditCard,
  title: "เช็กเครดิต (Quota)",
  description:
    "แสดงเครดิตที่ project ใช้ไปเทียบกับทั้งหมด ตัวเลขสีม่วงหลังเครื่องหมาย + คือเครดิตที่งานนี้จะใช้",
};
const generateStep = (title: string, description: string): GuideStep => ({
  id: "generate",
  selector: tour("generate"),
  icon: Sparkles,
  title,
  description,
  tip: "ระหว่างที่กำลังสร้าง tab อื่นจะถูกล็อกไว้ชั่วคราว",
});
const resultStep: GuideStep = {
  id: "result",
  selector: tour("result"),
  icon: Star,
  title: "ดูผลลัพธ์",
  description: "งานที่เสร็จแล้วจะขึ้นที่นี่ เรียงต่อกันแบบแชท เลื่อนขึ้นเพื่อดูงานเก่า",
  tip: "ถ้ายังว่าง กดปุ่มตัวอย่าง prompt ใต้ข้อความ Ready to generate เพื่อเริ่มเร็ว",
};
const uploadStep = (description: string): GuideStep => ({
  id: "upload",
  selector: tour("upload"),
  icon: ImageIcon,
  title: "ไฟล์อ้างอิง (ไม่บังคับ)",
  description,
});
const promptStep = (description: string, example: string, tip?: string): GuideStep => ({
  id: "prompt",
  selector: tour("prompt"),
  icon: PenLine,
  title: "เขียน Prompt",
  description,
  example,
  tip,
});
const settingsStep = (description: string): GuideStep => ({
  id: "settings",
  selector: tour("settings"),
  icon: SlidersHorizontal,
  title: "Settings",
  description,
});

const GENERATE_COMMON = [templateStep, brandStep, quotaStep];

const TAB_STEPS: Record<string, GuideStep[]> = {
  image: [
    modelStep(
      "แต่ละ model ให้สไตล์ คุณภาพ และใช้เครดิตต่างกัน ชี้ที่ชื่อ model เพื่อดูราคาและข้อจำกัด",
      "ระบบจำ model ล่าสุดที่คุณเลือกใน project นี้ไว้ให้",
    ),
    uploadStep("กด + เพื่ออัปโหลดรูปให้ AI ใช้เป็นต้นแบบ เช่น รูปสินค้า หรือกดรูปดินสอเพื่อวาดภาพร่างเอง"),
    promptStep(
      "บอกสิ่งที่อยากได้ให้ชัด ทั้งวัตถุ ฉาก แสง อารมณ์ และสไตล์",
      "Professional product photography of a ceramic coffee mug, studio lighting, white background",
    ),
    settingsStep("เลือก Aspect Ratio จำนวนภาพ และ Resolution ตัวเลขบนปุ่ม Generate จะเปลี่ยนตามจำนวนภาพ"),
    ...GENERATE_COMMON,
    generateStep("กด Generate", "ระบบเริ่มสร้างทันที และแสดงความคืบหน้าในฝั่งขวา"),
    resultStep,
  ],
  video: [
    modelStep("เลือก model วิดีโอ แต่ละตัวรองรับความยาว ความละเอียด และไฟล์อ้างอิงต่างกัน"),
    uploadStep("อัปโหลดรูป วิดีโอ หรือเสียงเพื่อกำหนดตัวละคร ฉาก หรือเฟรมแรก"),
    promptStep(
      "บอกว่าอะไรเคลื่อนไหวอย่างไร และกล้องทำอะไร",
      "Dynamic product demonstration of @image1, smooth camera movements",
      "พิมพ์ @ เพื่ออ้างถึงไฟล์ที่อัปโหลดไว้",
    ),
    settingsStep("เลือกความยาว สัดส่วน และความละเอียดของวิดีโอ"),
    ...GENERATE_COMMON,
    generateStep("กด Generate Video", "วิดีโอใช้เวลาสร้างนานกว่าภาพ ความคืบหน้าจะแสดงในฝั่งขวา"),
    resultStep,
  ],
  audio: [
    modelStep("เลือก model เสียงที่ต้องการ"),
    {
      id: "voice",
      selector: tour("voice"),
      icon: Mic,
      title: "Voice references (ไม่บังคับ)",
      description: "ใส่เสียงต้นแบบได้สูงสุด 3 เสียง แล้วอ้างถึงใน prompt ด้วย @Audio1, @Audio2",
    },
    {
      id: "ref-image",
      selector: tour("ref-image"),
      icon: ImageIcon,
      title: "Reference image (ไม่บังคับ)",
      description: "ใส่รูปฉากเพื่อสร้างเสียงที่เข้ากับภาพ เลือกใช้รูปหรือเสียงต้นแบบอย่างใดอย่างหนึ่ง",
    },
    promptStep(
      "บอกบทพูด เพลง หรือเสียงที่อยากได้",
      "A warm female voice like @Audio1 says: “Welcome back!” over soft piano.",
    ),
    {
      id: "output",
      selector: tour("output"),
      icon: SlidersHorizontal,
      title: "Output",
      description: "เลือกไฟล์ MP3 / WAV / OGG และปรับความเร็วพูด ความดัง และระดับเสียง",
    },
    quotaStep,
    generateStep("กด Generate Audio", "ระบบเริ่มสร้างเสียง และแสดงผลในฝั่งขวาเมื่อเสร็จ"),
    resultStep,
  ],
  omnihumen: [
    modelStep("เลือก model ที่ใช้สร้างคนพูด"),
    uploadStep("อัปโหลดรูปคนและไฟล์เสียงที่ต้องการให้พูด"),
    promptStep("บอกท่าทางและอารมณ์ของคนในวิดีโอ", "Professional business person, confident posture, speaking to camera"),
    quotaStep,
    generateStep("กด Generate", "ระบบเริ่มสร้าง และแสดงความคืบหน้าในฝั่งขวา"),
    resultStep,
  ],
  dreamactor: [
    modelStep("เลือก model ที่ใช้ทำให้ตัวละครขยับ"),
    uploadStep("อัปโหลดรูปตัวละคร และวิดีโอต้นแบบที่มีท่าทางที่ต้องการ"),
    quotaStep,
    generateStep("กด Generate", "ระบบเริ่มสร้าง และแสดงความคืบหน้าในฝั่งขวา"),
    resultStep,
  ],
  library: [
    {
      id: "library-head",
      selector: tour("library-head"),
      icon: Star,
      title: "Library",
      description: "รวมผลงานที่บันทึกเก็บไว้ใน project นี้ ตัวเลขด้านล่างคือจำนวนชิ้นทั้งหมด",
    },
    {
      id: "library-card",
      selector: `${tour("library-grid")} .ant-card`,
      icon: ImageIcon,
      title: "การ์ดผลงาน",
      description:
        "แต่ละการ์ดบอกประเภท ความละเอียด model คนสร้าง prompt และวันที่ กดที่การ์ดเพื่อดูรายละเอียดหรือดาวน์โหลด",
      tip: "ชี้เมาส์ที่วิดีโอเพื่อเล่นตัวอย่าง",
    },
  ],
  activity: [
    {
      id: "activity-table",
      selector: tour("activity-table"),
      icon: Table,
      title: "ประวัติการสร้าง",
      description: "ทุกงานที่สร้างใน project อยู่ในตารางนี้ พร้อมประเภท prompt model คนสร้าง และวันที่ กดรูปเพื่อดูภาพใหญ่",
    },
    {
      id: "activity-actions",
      selector: `${tour("activity-table")} .ant-table-thead th:last-child`,
      icon: Download,
      title: "Actions",
      description: "ปุ่มในคอลัมน์นี้ใช้ติดดาว ดาวน์โหลด ลบ และแชร์ผลงาน",
    },
  ],
  "video-editor": [
    {
      id: "ve-bin",
      selector: tour("ve-bin"),
      icon: FolderOpen,
      title: "คลังสื่อ",
      description: "ดึงวิดีโอ รูป และเสียงจาก All Activity หรือนำเข้าจากเครื่อง แล้วกด + เพื่อวางลง timeline",
      tip: "ไฟล์จากเครื่องอยู่ในเครื่องคุณเท่านั้น ไม่ถูกอัปโหลด",
    },
    {
      id: "ve-preview",
      selector: tour("ve-preview"),
      icon: Play,
      title: "Preview",
      description: "ดูผลลัพธ์ระหว่างตัดต่อ และเลือกสัดส่วน 9:16, 16:9 หรือ 1:1",
    },
    {
      id: "ve-inspector",
      selector: tour("ve-inspector"),
      icon: SlidersHorizontal,
      title: "ปรับแต่งคลิป",
      description: "เลือกคลิปบน timeline แล้วปรับความยาว ระดับเสียง แยก ทำซ้ำ หรือลบได้ที่นี่",
    },
    {
      id: "ve-timeline",
      selector: tour("ve-timeline"),
      icon: Clapperboard,
      title: "Timeline",
      description: "ลากคลิปเพื่อย้ายตำแหน่ง ลากขอบคลิปเพื่อตัด และวางเพลงในแถวเสียง",
    },
    {
      id: "ve-export",
      selector: tour("ve-export"),
      icon: Download,
      title: "Export",
      description: "เมื่อตัดต่อเสร็จ กด Export เป็น MP4 แล้วดาวน์โหลด หรือบันทึกเข้า Library",
    },
  ],
};

const MOCKUP_BY_TAB: Record<string, ComponentType<GuideMockupProps>> = {
  library: LibraryMockup,
  activity: ActivityMockup,
  "video-editor": VideoEditorMockup,
};

const TAB_LABEL: Record<string, string> = {
  image: "Image Gen",
  video: "Video Gen",
  omnihumen: "OmniHuman",
  dreamactor: "DreamActor",
  audio: "Audio Gen",
  workflow: "Workflow",
  library: "Library",
  activity: "All Activity",
  editor: "Editor",
  "video-editor": "Video Editor",
  social: "Public Social",
};

/** Guide for the project work page; tabs without their own steps still get the header steps. */
export function workPageGuide(activeKey: string): GuideContent {
  return {
    title: `วิธีใช้ ${TAB_LABEL[activeKey] ?? "หน้าทำงาน"}`,
    intro: "รู้จักหน้าทำงาน แล้วทำตามขั้นตอนของ tab นี้",
    steps: [...HEAD_STEPS, ...(TAB_STEPS[activeKey] ?? [])],
    mockup: MOCKUP_BY_TAB[activeKey] ?? GenerateMockup,
  };
}
