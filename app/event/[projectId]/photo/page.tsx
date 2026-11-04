"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type {
  IPhotoEventGeneration,
  IPhotoEventTemplate,
} from "@/app/common/photo-event.type";
import PhotoEventService, {
  getPhotoEventErrorMessage,
} from "@/app/services/photo-event.service";
import ProjectService from "@/app/services/project.service";
import { axiosCore } from "@/app/lib/axios/axios";
import { usePhotoEventPhotos } from "@/app/hooks/usePhotoEventPhotos";
import { usePrintGeneration } from "@/app/components/photo-event/print-sheet";
import { toPrintDesign } from "@/app/utils/photo-event-print";
import KioskChrome from "./components/kiosk-chrome";
import TemplateStep from "./components/template-step";
import PhotoStep from "./components/photo-step";
import GeneratingStep from "./components/generating-step";
import ResultStep from "./components/result-step";
import DisplaySettings from "./components/display-settings";
import { useKioskDisplay } from "./kiosk-display";
import { useIdleCountdown } from "./use-idle-countdown";
import {
  KIOSK_ATTRACT_SECONDS,
  KIOSK_GENERATE_TIMEOUT_MS,
  KIOSK_IDLE_SECONDS,
  KIOSK_POLL_MS,
  TKioskStep,
} from "./kiosk.types";
import "./styles/kiosk.css";

/** เปลี่ยน step แบบ cross-fade (เก่าจางออก ใหม่จางเข้า) — browser ที่ไม่มี View Transitions เปลี่ยนทันที */
const transitionStep = (update: () => void) => {
  if (typeof document.startViewTransition !== "function") return update();
  document.startViewTransition(() => flushSync(update));
};

const PhotoKioskPage = () => {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const photoEventService = useMemo(() => PhotoEventService(axiosCore), []);
  const projectService = useMemo(() => ProjectService(axiosCore), []);

  const [step, setStep] = useState<TKioskStep>("template");
  const [projectName, setProjectName] = useState("");
  const [templates, setTemplates] = useState<IPhotoEventTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [template, setTemplate] = useState<IPhotoEventTemplate | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<IPhotoEventGeneration | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const generationIdRef = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { display, updateDisplay, layout } = useKioskDisplay(stageRef);

  const applyGenerationUpdate = useCallback((next: IPhotoEventGeneration) => {
    if (next.id !== generationIdRef.current) return;
    setGeneration(next);
    if (next.status === "success" && next.resultUrl) transitionStep(() => setStep("result"));
    if (next.status === "failed") setErrorMessage(next.errorMessage || "Generation failed");
  }, []);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { photos, applyGeneration, addPhotos } = usePhotoEventPhotos(projectId, {
    onGenerationUpdated: applyGenerationUpdate,
  });
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? null;

  const loadTemplates = useCallback(async () => {
    const result = await photoEventService.findTemplates(projectId);
    setTemplates(result);
    setTemplatesLoading(false);
  }, [photoEventService, projectId]);

  useEffect(() => {
    loadTemplates();
    projectService.findById(projectId).then((project) => setProjectName(project?.name ?? ""));
  }, [loadTemplates, projectService, projectId]);

  const restart = useCallback(() => {
    generationIdRef.current = null;
    transitionStep(() => {
      setGeneration(null);
      setErrorMessage(null);
      setSelectedPhotoId(null);
      setPrintFailed(false);
      setUploadError(null);
      setCameraOpen(false);
      setTemplate(null);
      setStep("template");
    });
    // โหลดใหม่เพื่อให้ URL รูป template ไม่หมดอายุ และเห็น template ที่ staff เพิ่งแก้
    loadTemplates();
  }, [loadTemplates]);

  const [printFailed, setPrintFailed] = useState(false);
  const { print, printing, sheet: printSheet } = usePrintGeneration(() =>
    setPrintFailed(true),
  );

  // หยุดนับถอยหลังระหว่างพิมพ์/ถ่ายรูป/ตั้งค่าจอ — กันจอรีเซ็ตกลับหน้าแรกกลางคัน
  const idleSecondsLeft = useIdleCountdown(
    (step === "photo" || step === "result") &&
      !printing &&
      !cameraOpen &&
      !uploading &&
      !settingsOpen,
    KIOSK_IDLE_SECONDS,
    restart,
  );

  const [attract, setAttract] = useState(false);
  useIdleCountdown(step === "template" && !attract && !settingsOpen, KIOSK_ATTRACT_SECONDS, () =>
    setAttract(true),
  );
  useEffect(() => {
    if (!attract) return;
    const stop = () => setAttract(false);
    window.addEventListener("pointerdown", stop);
    return () => window.removeEventListener("pointerdown", stop);
  }, [attract]);

  const uploadGuestPhoto = async (file: File) => {
    if (!userId) {
      setUploadError("Session expired. Please ask staff to sign in again.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const [created] = await photoEventService.uploadPhotos(projectId, userId, [file]);
      if (!created) throw new Error("The photo could not be saved. Please try again.");
      addPhotos([created]);
      setSelectedPhotoId(created.id);
    } catch (error) {
      setUploadError(getPhotoEventErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const startGeneration = async () => {
    if (!template || !selectedPhoto || !userId) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const created = await photoEventService.createGeneration(projectId, {
        userId,
        photoId: selectedPhoto.id,
        promptGuideId: template.promptGuideId,
      });
      generationIdRef.current = created.id;
      applyGeneration(created);
      transitionStep(() => setStep("generating"));
      applyGenerationUpdate(created);
    } catch (error) {
      setErrorMessage(getPhotoEventErrorMessage(error));
      transitionStep(() => setStep("generating"));
    } finally {
      setSubmitting(false);
    }
  };

  // socket เป็นช่องทางหลัก — polling กันกรณี event หลุดระหว่าง reconnect
  useEffect(() => {
    if (step !== "generating" || errorMessage || !generation) return;
    const generationId = generation.id;
    const startedAt = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - startedAt > KIOSK_GENERATE_TIMEOUT_MS) {
        setErrorMessage("This is taking longer than expected. Please try again.");
        return;
      }
      const latest = await photoEventService.findGeneration(projectId, generationId);
      if (latest) applyGenerationUpdate(latest);
    }, KIOSK_POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart polling only per generation
  }, [step, errorMessage, generation?.id]);

  const goBack = () => {
    if (step === "template") router.push("/page/photo-event");
    else if (step === "photo") transitionStep(() => setStep("template"));
    else restart();
  };

  return (
    <div
      ref={stageRef}
      className={display.frame ? "kiosk-stage is-framed" : "kiosk-stage"}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="kiosk-root" style={layout?.rootStyle}>
        <KioskChrome step={step} onBack={goBack} onOpenSettings={() => setSettingsOpen(true)} />
        {step === "template" && (
          <TemplateStep
            projectName={projectName}
            templates={templates}
            loading={templatesLoading}
            columns={display.templateColumns}
            attract={attract}
            onSelect={(selected) => {
              transitionStep(() => {
                setTemplate(selected);
                setStep("photo");
              });
            }}
          />
        )}
        {step === "photo" && template && (
          <PhotoStep
            template={template}
            photos={photos}
            selectedPhoto={selectedPhoto}
            submitting={submitting}
            uploading={uploading}
            uploadError={uploadError}
            cameraOpen={cameraOpen}
            onCameraOpenChange={setCameraOpen}
            onTakePhoto={uploadGuestPhoto}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
            onChangeTemplate={() => transitionStep(() => setStep("template"))}
            onGenerate={startGeneration}
          />
        )}
        {step === "generating" && (
          <GeneratingStep
            photo={selectedPhoto}
            progress={generation?.progress ?? null}
            errorMessage={errorMessage}
            onRetry={startGeneration}
            onRestart={restart}
          />
        )}
        {step === "result" && generation && (
          <ResultStep
            generation={generation}
            idleSecondsLeft={idleSecondsLeft}
            printing={printing}
            printFailed={printFailed}
            onPrint={() => {
              setPrintFailed(false);
              print(
                generation,
                photoEventService.findActivePrintTemplate(projectId).then(toPrintDesign),
              );
            }}
            onRestart={restart}
          />
        )}
        {printSheet}
      </div>
      {settingsOpen && layout && (
        <DisplaySettings
          display={display}
          layout={layout}
          onChange={updateDisplay}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default PhotoKioskPage;
