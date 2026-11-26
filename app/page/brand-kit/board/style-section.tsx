"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Select } from "antd";
import type { TBrandKitStyle } from "@/app/common/brand-kit";

// the value is what the AI reads, so each is a phrase that works inside a sentence
const LOOKS = [
  { value: "photography", label: "Photo" },
  { value: "illustration", label: "Illustration" },
  { value: "3D render", label: "3D" },
  { value: "graphic design", label: "Graphic" },
];

const normalize = (style?: TBrandKitStyle | null): Required<TBrandKitStyle> => ({
  mood: style?.mood ?? "",
  look: style?.look ?? "",
  lighting: style?.lighting ?? "",
  mustHave: style?.mustHave ?? [],
});

type Props = {
  style?: TBrandKitStyle | null;
  /** the kit still sends its earlier saved text, so these fields are stored but not sent yet */
  notSentYet: boolean;
  onSave: (style: TBrandKitStyle) => Promise<boolean>;
};

/** How the brand looks beyond its colours. An empty field adds nothing to the prompt. */
export default function StyleSection({ style, notSentYet, onSave }: Props) {
  const saved = normalize(style);
  const savedKey = JSON.stringify(saved);
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  // reset when another kit is selected or a save lands
  useEffect(() => setDraft(JSON.parse(savedKey)), [savedKey]);

  const dirty = JSON.stringify(draft) !== savedKey;
  const set = (change: Partial<TBrandKitStyle>) =>
    setDraft((current) => ({ ...current, ...change }));

  return (
    <section aria-labelledby="bk-style">
      <div className="bk-section-head">
        <div>
          <h2 className="bk-h2" id="bk-style">
            Style
          </h2>
          <p className="bk-note">
            {notSentYet
              ? "Saved with the kit, and sent once you switch this kit to the board in Brand Prompt."
              : "Describe the look in a few words. Leave a field empty to let each prompt decide."}
          </p>
        </div>
        {dirty && (
          <Button
            type="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              await onSave({
                mood: draft.mood.trim(),
                look: draft.look,
                lighting: draft.lighting.trim(),
                mustHave: draft.mustHave,
              });
              setSaving(false);
            }}
          >
            Save style
          </Button>
        )}
      </div>
      <div className="bk-style">
        <label>
          <span className="bk-field-label">Mood</span>
          <Input
            value={draft.mood}
            maxLength={200}
            placeholder="e.g. warm, playful, confident"
            onChange={(e) => set({ mood: e.target.value })}
          />
        </label>
        <label>
          <span className="bk-field-label">Look</span>
          <Select
            value={draft.look || undefined}
            allowClear
            placeholder="Any"
            style={{ width: "100%" }}
            options={LOOKS}
            onChange={(look) => set({ look: look ?? "" })}
          />
        </label>
        <label>
          <span className="bk-field-label">Lighting</span>
          <Input
            value={draft.lighting}
            maxLength={200}
            placeholder="e.g. soft daylight"
            onChange={(e) => set({ lighting: e.target.value })}
          />
        </label>
        <label>
          <span className="bk-field-label">Must include</span>
          <Select
            mode="tags"
            value={draft.mustHave}
            open={false}
            maxCount={12}
            tokenSeparators={[","]}
            placeholder="Type and press Enter, e.g. rounded shapes"
            style={{ width: "100%" }}
            onChange={(mustHave: string[]) =>
              set({ mustHave: mustHave.map((v) => v.trim().slice(0, 100)).filter(Boolean) })
            }
          />
        </label>
      </div>
    </section>
  );
}
