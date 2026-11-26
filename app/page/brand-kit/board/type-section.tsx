"use client";

import React, { useState } from "react";
import { Button, Input, Popconfirm, Popover, Select, Switch } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { BoardFont, FONT_ROLES, FontRole } from "./model";

export type FontDraft = { name: string; role: FontRole; weight: string };

const WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];

type EditorProps = {
  initial: FontDraft;
  submitLabel: string;
  onSubmit: (draft: FontDraft) => Promise<boolean>;
  onCancel: () => void;
};

function FontEditor({ initial, submitLabel, onSubmit, onCancel }: EditorProps) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const name = draft.name.trim();

  const submit = async () => {
    setSaving(true);
    await onSubmit({ ...draft, name });
    setSaving(false);
  };

  return (
    <div className="bk-popover">
      <label>
        <span className="bk-field-label">Font name</span>
        <Input
          value={draft.name}
          maxLength={100}
          placeholder="e.g. DB Helvethaica X"
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onPressEnter={() => {
            if (name) submit();
          }}
        />
      </label>
      <label>
        <span className="bk-field-label">Used for</span>
        <Select
          value={draft.role}
          style={{ width: "100%" }}
          options={FONT_ROLES.map((role) => ({ value: role, label: role }))}
          onChange={(role) => setDraft((d) => ({ ...d, role }))}
        />
      </label>
      <label>
        <span className="bk-field-label">Weight</span>
        <Select
          value={draft.weight}
          style={{ width: "100%" }}
          options={WEIGHTS.map((weight) => ({ value: weight, label: weight }))}
          onChange={(weight) => setDraft((d) => ({ ...d, weight }))}
        />
      </label>
      <div className="bk-popover-foot">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          loading={saving}
          disabled={!name}
          onClick={submit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

type RowProps = {
  font: BoardFont;
  onSave: (draft: FontDraft, id?: string) => Promise<boolean>;
  onToggleSend: (id: string, send: boolean) => void;
  onDelete: (id: string) => void;
};

function FontRow({ font, onSave, onToggleSend, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false);
  const switchId = `bk-send-${font.id}`;
  return (
    <li className="bk-font">
      <div>
        <div className="bk-font-name">{font.name}</div>
        <div className="bk-font-meta">
          {font.role}, weight {font.weight}
        </div>
      </div>
      <div className="bk-font-send">
        <label htmlFor={switchId}>Send to AI</label>
        <Switch
          id={switchId}
          size="small"
          checked={font.includeInPrompt}
          onChange={(send) => onToggleSend(font.id, send)}
        />
      </div>
      <div className="bk-row-actions">
        <Popover
          open={editing}
          onOpenChange={setEditing}
          trigger="click"
          placement="bottomRight"
          destroyTooltipOnHide
          content={
            <FontEditor
              initial={{ name: font.name, role: font.role, weight: font.weight }}
              submitLabel="Save font"
              onCancel={() => setEditing(false)}
              onSubmit={async (draft) => {
                const saved = await onSave(draft, font.id);
                if (saved) setEditing(false);
                return saved;
              }}
            />
          }
        >
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${font.name}`}
          />
        </Popover>
        <Popconfirm
          title={`Delete ${font.name}?`}
          okText="Delete font"
          okButtonProps={{ danger: true }}
          cancelText="Keep font"
          onConfirm={() => onDelete(font.id)}
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete ${font.name}`}
          />
        </Popconfirm>
      </div>
    </li>
  );
}

type Props = {
  fonts: BoardFont[];
  onSave: (draft: FontDraft, id?: string) => Promise<boolean>;
  onToggleSend: (id: string, send: boolean) => void;
  onDelete: (id: string) => void;
};

/** The brand's fonts, kept as a record. A font reaches the AI only when its switch is on. */
export default function TypeSection({
  fonts,
  onSave,
  onToggleSend,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-labelledby="bk-type">
      <div className="bk-section-head">
        <div>
          <h2 className="bk-h2" id="bk-type">
            Typography
          </h2>
          <p className="bk-note">
            Image and video models rarely follow a font name. Switch a font on
            only when you want the AI to draw lettering in that style.
          </p>
        </div>
        <Popover
          open={adding}
          onOpenChange={setAdding}
          trigger="click"
          placement="bottomRight"
          destroyTooltipOnHide
          content={
            <FontEditor
              initial={{ name: "", role: "Body", weight: "400" }}
              submitLabel="Add font"
              onCancel={() => setAdding(false)}
              onSubmit={async (draft) => {
                const saved = await onSave(draft);
                if (saved) setAdding(false);
                return saved;
              }}
            />
          }
        >
          <Button icon={<PlusOutlined />}>Add font</Button>
        </Popover>
      </div>
      {fonts.length === 0 ? (
        <p className="bk-empty">No fonts saved for this kit.</p>
      ) : (
        <ul className="bk-fonts">
          {fonts.map((font) => (
            <FontRow
              key={font.id}
              font={font}
              onSave={onSave}
              onToggleSend={onToggleSend}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
