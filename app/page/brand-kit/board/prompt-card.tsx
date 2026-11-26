"use client";

import React, { useEffect, useState } from "react";
import { Button, Input } from "antd";
import type { TBrandKit } from "@/app/common/brand-kit";
import type { TBrandPromptPreview } from "@/app/services/brand-kit.service";
import { BoardColor } from "./model";
import { useTweenedNumber } from "./motion";

type ModelRowProps = {
  row: TBrandPromptPreview;
  open: boolean;
  onToggle: () => void;
};

function ModelRow({ row, open, onToggle }: ModelRowProps) {
  const used = useTweenedNumber(row.usedChars);
  const over = row.dropped.length > 0;
  const ratio = Math.min(1, row.usedChars / Math.max(1, row.brandKitBudget));
  return (
    <li>
      <button
        type="button"
        className="bk-model"
        aria-expanded={open}
        data-over={over}
        onClick={onToggle}
      >
        <span className="bk-model-row">
          <span>{row.name ?? row.modelType}</span>
          <span className="bk-model-count">
            {used} / {row.brandKitBudget}
          </span>
        </span>
        <span className="bk-meter" aria-hidden="true">
          <i style={{ "--bk-used": ratio } as React.CSSProperties} />
        </span>
      </button>
      {open && (
        <>
          {over && (
            <p className="bk-note">
              Left out to fit this model: {row.dropped.join(", ")}
            </p>
          )}
          <p className="bk-prompt-text">
            {row.text || "This kit has nothing to add yet."}
          </p>
        </>
      )}
    </li>
  );
}

type FieldProps = {
  label: string;
  hint: string;
  value: string;
  saveLabel: string;
  onSave: (value: string) => Promise<boolean>;
};

/** A text field that offers its save button only once the text differs from what is stored. */
function SavedText({ label, hint, value, saveLabel, onSave }: FieldProps) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(value), [value]);
  const dirty = draft.trim() !== value.trim();
  return (
    <label>
      <span className="bk-field-label">{label}</span>
      <Input.TextArea
        value={draft}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder={hint}
        onChange={(e) => setDraft(e.target.value)}
      />
      {dirty && (
        <span className="bk-field-foot">
          <Button
            size="small"
            type="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(draft.trim());
              setSaving(false);
            }}
          >
            {saveLabel}
          </Button>
        </span>
      )}
    </label>
  );
}

type Props = {
  kit: TBrandKit;
  rows: TBrandPromptPreview[];
  colors: BoardColor[];
  freshId: string | null;
  onSaveNegative: (text: string) => Promise<boolean>;
  onSaveCustom: (text: string) => Promise<boolean>;
  /** the owner's one-time choice for a kit that still sends its older saved text */
  onLegacyChoice: (keep: boolean) => Promise<boolean>;
};

/** What this kit sends to each model, updated as the board is edited. */
export default function PromptCard({
  kit,
  rows,
  colors,
  freshId,
  onSaveNegative,
  onSaveCustom,
  onLegacyChoice,
}: Props) {
  const [openModel, setOpenModel] = useState<number | null>(null);
  const [choosing, setChoosing] = useState<"keep" | "drop" | null>(null);
  const legacy = kit.promptVersion !== 2;
  const legacyText = (kit.brandCiPrompt ?? "").trim();

  const choose = async (keep: boolean) => {
    setChoosing(keep ? "keep" : "drop");
    await onLegacyChoice(keep);
    setChoosing(null);
  };

  return (
    <aside className="bk-card" aria-labelledby="bk-prompt">
      <div>
        <h2 className="bk-h2" id="bk-prompt">
          Brand Prompt
        </h2>
        <p className="bk-sub">Added to your prompt whenever this kit is on.</p>
      </div>

      {legacy && (
        <div className="bk-legacy">
          <strong>This kit still sends its earlier saved text.</strong>
          {legacyText && <div className="bk-legacy-text">{legacyText}</div>}
          <span>
            Switch to sending the colors and settings on this board. You can
            keep the earlier text as extra instructions, or leave it out.
          </span>
          <div className="bk-legacy-actions">
            {legacyText && (
              <Button
                size="small"
                loading={choosing === "keep"}
                disabled={choosing === "drop"}
                onClick={() => choose(true)}
              >
                Switch and keep the text
              </Button>
            )}
            <Button
              size="small"
              type="primary"
              loading={choosing === "drop"}
              disabled={choosing === "keep"}
              onClick={() => choose(false)}
            >
              {legacyText ? "Switch without it" : "Switch to the board"}
            </Button>
          </div>
        </div>
      )}

      {!legacy && colors.length > 0 && (
        <div className="bk-dots" aria-hidden="true">
          {colors.map((color) => (
            <span
              key={color.id}
              className="bk-dot"
              data-fresh={color.id === freshId}
              style={{ background: color.hex }}
            />
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div>
          <span className="bk-field-label">
            Characters used of each model’s allowance. Select a model to read
            the text.
          </span>
          <ul className="bk-models">
            {rows.map((row) => (
              <ModelRow
                key={row.modelId}
                row={row}
                open={openModel === row.modelId}
                onToggle={() =>
                  setOpenModel((current) =>
                    current === row.modelId ? null : row.modelId,
                  )
                }
              />
            ))}
          </ul>
        </div>
      )}

      <SavedText
        label="Negative Prompt"
        hint="What the AI should avoid, e.g. neon colors, clutter"
        value={kit.negativePrompt ?? ""}
        saveLabel="Save Negative Prompt"
        onSave={onSaveNegative}
      />

      {!legacy && (
        <SavedText
          label="Extra instructions"
          hint="Anything else every generation should follow"
          value={kit.customPrompt ?? ""}
          saveLabel="Save instructions"
          onSave={onSaveCustom}
        />
      )}
    </aside>
  );
}
