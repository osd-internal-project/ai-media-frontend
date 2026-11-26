"use client";

import React, { useRef, useState } from "react";
import { Button, Checkbox, Input, Select } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { countLabel } from "../helpers/countLabel";
import { extractPalette, nameColor, parseHexList } from "./color-import";
import type { ColorDraft } from "./color-section";
import { COLOR_ROLES, ColorRole } from "./model";

type Candidate = { hex: string; name: string; checked: boolean };

type Props = {
  /** #RRGGBB codes already in the kit, upper case */
  existing: string[];
  onAdd: (drafts: ColorDraft[], origin: DOMRect) => Promise<boolean>;
  onCancel: () => void;
};

/** Several colours at once: paste their codes, or let the browser read them from an image. */
export default function ImportColors({ existing, onAdd, onCancel }: Props) {
  const [text, setText] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [role, setRole] = useState<ColorRole>("primary");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const offer = (hexes: string[]) =>
    setCandidates(
      hexes.map((hex) => ({
        hex,
        name: nameColor(hex),
        checked: !existing.includes(hex),
      })),
    );

  const readImage = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      offer(await extractPalette(file));
    } catch {
      setError("Couldn't read that image. Try a PNG or JPG file.");
    }
  };

  const chosen = candidates.filter(
    (c) => c.checked && c.name.trim() && !existing.includes(c.hex),
  );

  const patch = (hex: string, change: Partial<Candidate>) =>
    setCandidates((list) =>
      list.map((c) => (c.hex === hex ? { ...c, ...change } : c)),
    );

  return (
    <div className="bk-popover bk-import">
      <label>
        <span className="bk-field-label">Paste color codes</span>
        <Input.TextArea
          value={text}
          rows={2}
          placeholder="#D62A84, #155791, #F0BC4D"
          onChange={(e) => {
            setText(e.target.value);
            offer(parseHexList(e.target.value));
          }}
        />
      </label>
      <div>
        <Button
          icon={<PictureOutlined />}
          onClick={() => fileInput.current?.click()}
        >
          Pick colors from an image
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            readImage(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="bk-note" style={{ marginTop: 6 }}>
          The image is read on this device and is not uploaded.
        </p>
      </div>
      {error && (
        <p className="bk-note" role="alert" style={{ color: "var(--bk-error)" }}>
          {error}
        </p>
      )}

      {candidates.length > 0 && (
        <>
          <ul className="bk-cands">
            {candidates.map((c) => {
              const taken = existing.includes(c.hex);
              return (
                <li key={c.hex} className="bk-cand">
                  <Checkbox
                    checked={c.checked && !taken}
                    disabled={taken}
                    aria-label={`Add ${c.hex}`}
                    onChange={(e) => patch(c.hex, { checked: e.target.checked })}
                  />
                  <span
                    className="bk-cand-chip"
                    style={{ background: c.hex }}
                    aria-hidden="true"
                  />
                  {taken ? (
                    <span className="bk-note">{c.hex} is already in this kit</span>
                  ) : (
                    <Input
                      size="small"
                      value={c.name}
                      maxLength={100}
                      aria-label={`Name for ${c.hex}`}
                      suffix={<span className="bk-cand-hex">{c.hex}</span>}
                      onChange={(e) => patch(c.hex, { name: e.target.value })}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <label>
            <span className="bk-field-label">Add as</span>
            <Select
              value={role}
              style={{ width: "100%" }}
              options={COLOR_ROLES.map((r) => ({ value: r.value, label: r.label }))}
              onChange={setRole}
            />
          </label>
        </>
      )}

      <div className="bk-popover-foot">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          loading={busy}
          disabled={chosen.length === 0}
          onClick={async (event) => {
            const origin = event.currentTarget.getBoundingClientRect();
            setBusy(true);
            await onAdd(
              chosen.map((c) => ({ name: c.name.trim(), hex: c.hex, role })),
              origin,
            );
            setBusy(false);
          }}
        >
          {chosen.length > 0
            ? `Add ${countLabel(chosen.length, "color")}`
            : "Add colors"}
        </Button>
      </div>
    </div>
  );
}
