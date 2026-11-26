"use client";

import React, { useRef, useState } from "react";
import { Button, ColorPicker, Input, Popconfirm, Popover, Select } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardColor, COLOR_ROLES, ColorRole } from "./model";
import ImportColors from "./import-colors";

export type ColorDraft = { name: string; hex: string; role: ColorRole };

/** Saves a colour; `origin` is where the colour was entered, the start of its flight to the strip. */
export type SaveColor = (
  draft: ColorDraft,
  id: string | undefined,
  origin: DOMRect,
) => Promise<boolean>;

type EditorProps = {
  initial: ColorDraft;
  submitLabel: string;
  onSubmit: (draft: ColorDraft, origin: DOMRect) => Promise<boolean>;
  onCancel: () => void;
};

function ColorEditor({ initial, submitLabel, onSubmit, onCancel }: EditorProps) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const name = draft.name.trim();

  const submit = async (event: React.MouseEvent<HTMLElement>) => {
    const origin = event.currentTarget.getBoundingClientRect();
    setSaving(true);
    await onSubmit({ ...draft, name }, origin);
    setSaving(false);
  };

  return (
    <div className="bk-popover">
      <ColorPicker
        value={draft.hex}
        format="hex"
        disabledAlpha
        showText
        onChange={(color) =>
          setDraft((d) => ({ ...d, hex: color.toHexString().toUpperCase() }))
        }
      />
      <label>
        <span className="bk-field-label">Color name</span>
        <Input
          value={draft.name}
          maxLength={100}
          placeholder="e.g. Vibrant Pink"
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        />
      </label>
      <label>
        <span className="bk-field-label">Role</span>
        <Select
          value={draft.role}
          style={{ width: "100%" }}
          options={COLOR_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          onChange={(role) => setDraft((d) => ({ ...d, role }))}
        />
      </label>
      <p className="bk-note">
        A plain name like “warm yellow” guides the AI better than the code
        alone.
      </p>
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

type SwatchProps = {
  color: BoardColor;
  fresh: boolean;
  copied: boolean;
  /** true right after a drag, when the pointer-up would otherwise count as a click */
  wasDragged: () => boolean;
  onCopy: (color: BoardColor) => void;
  onSave: SaveColor;
  onDelete: (id: string) => void;
};

function Swatch({
  color,
  fresh,
  copied,
  wasDragged,
  onCopy,
  onSave,
  onDelete,
}: SwatchProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: color.id });
  const [editing, setEditing] = useState(false);
  const label = color.name || color.hex;

  return (
    <div
      ref={setNodeRef}
      className="bk-swatch"
      data-dragging={isDragging}
      data-fresh={fresh}
      data-copied={copied}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {/* pointer drags from the colour itself; keyboard reorders from the grip, so Enter here still copies */}
      <button
        type="button"
        className="bk-chip"
        style={{ background: color.hex }}
        aria-label={`Copy ${label} ${color.hex}`}
        onPointerDown={(event) => listeners?.onPointerDown?.(event)}
        onClick={() => {
          if (!wasDragged()) onCopy(color);
        }}
      />
      <span className="bk-swatch-name">{color.name || "Unnamed"}</span>
      <span className="bk-swatch-hex">
        {copied ? "Copied" : color.hex.toUpperCase()}
      </span>
      <span className="bk-swatch-actions">
        <button
          type="button"
          className="bk-icon-btn"
          data-grip
          ref={setActivatorNodeRef}
          {...attributes}
          aria-label={`Reorder ${label}`}
          onKeyDown={(event) => listeners?.onKeyDown?.(event)}
        >
          <HolderOutlined />
        </button>
        <Popover
          open={editing}
          onOpenChange={setEditing}
          trigger="click"
          destroyTooltipOnHide
          content={
            <ColorEditor
              initial={{ name: color.name, hex: color.hex, role: color.role }}
              submitLabel="Save color"
              onCancel={() => setEditing(false)}
              onSubmit={async (draft, origin) => {
                const saved = await onSave(draft, color.id, origin);
                if (saved) setEditing(false);
                return saved;
              }}
            />
          }
        >
          <button
            type="button"
            className="bk-icon-btn"
            aria-label={`Edit ${label}`}
          >
            <EditOutlined />
          </button>
        </Popover>
        <Popconfirm
          title={`Delete ${label}?`}
          okText="Delete color"
          okButtonProps={{ danger: true }}
          cancelText="Keep color"
          onConfirm={() => onDelete(color.id)}
        >
          <button
            type="button"
            className="bk-icon-btn"
            aria-label={`Delete ${label}`}
          >
            <DeleteOutlined />
          </button>
        </Popconfirm>
      </span>
    </div>
  );
}

type Props = {
  colors: BoardColor[];
  freshId: string | null;
  copiedId: string | null;
  onCopy: (color: BoardColor) => void;
  onSave: SaveColor;
  onDelete: (id: string) => void;
  /** ids of one role's colours in their new order */
  onReorder: (orderedIds: string[]) => void;
  /** several colours at once, from pasted codes or an image */
  onImport: (drafts: ColorDraft[], origin: DOMRect) => Promise<boolean>;
};

/** The kit's colours grouped by role. Order inside a role is the user's, and it is the order the AI reads. */
export default function ColorSection({
  colors,
  freshId,
  copiedId,
  onCopy,
  onSave,
  onDelete,
  onReorder,
  onImport,
}: Props) {
  const sensors = useSensors(
    // 6px of travel separates a drag from the click that copies
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const dragged = useRef(false);

  const groups = COLOR_ROLES.map((role) => ({
    ...role,
    items: colors.filter((c) => c.role === role.value),
  })).filter((group) => group.items.length > 0);

  const handleDragEnd = (ids: string[]) => (event: DragEndEvent) => {
    // the click that ends a drag fires after this handler; clear the flag once it has passed
    setTimeout(() => {
      dragged.current = false;
    }, 0);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(
      arrayMove(
        ids,
        ids.indexOf(String(active.id)),
        ids.indexOf(String(over.id)),
      ),
    );
  };

  return (
    <section aria-labelledby="bk-colors">
      <div className="bk-section-head">
        <div>
          <h2 className="bk-h2" id="bk-colors">
            Colors
          </h2>
          {colors.length > 0 && (
            <p className="bk-note">
              Click a color to copy its code. Drag to change the order the AI
              reads them in.
            </p>
          )}
        </div>
        <div className="bk-head-actions">
        <Popover
          open={importing}
          onOpenChange={setImporting}
          trigger="click"
          placement="bottomRight"
          destroyTooltipOnHide
          content={
            <ImportColors
              existing={colors.map((c) => c.hex.toUpperCase())}
              onCancel={() => setImporting(false)}
              onAdd={async (drafts, origin) => {
                const saved = await onImport(drafts, origin);
                if (saved) setImporting(false);
                return saved;
              }}
            />
          }
        >
          <Button>Paste or pick from image</Button>
        </Popover>
        <Popover
          open={adding}
          onOpenChange={setAdding}
          trigger="click"
          placement="bottomRight"
          destroyTooltipOnHide
          content={
            <ColorEditor
              initial={{ name: "", hex: "#6F6ADE", role: "primary" }}
              submitLabel="Add color"
              onCancel={() => setAdding(false)}
              onSubmit={async (draft, origin) => {
                const saved = await onSave(draft, undefined, origin);
                if (saved) setAdding(false);
                return saved;
              }}
            />
          }
        >
          <Button icon={<PlusOutlined />}>Add color</Button>
        </Popover>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="bk-empty">
          No colors yet. Paste your brand’s color codes or pick them from a
          logo, and the palette builds itself.
        </p>
      ) : (
        <div className="bk-groups">
          {groups.map((group) => {
            const ids = group.items.map((c) => c.id);
            return (
              <div key={group.value}>
                <h3 className="bk-group-label">{group.label}</h3>
                <DndContext
                  id={`bk-dnd-${group.value}`}
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={() => {
                    dragged.current = true;
                  }}
                  onDragEnd={handleDragEnd(ids)}
                  onDragCancel={() => {
                    dragged.current = false;
                  }}
                >
                  <SortableContext items={ids} strategy={rectSortingStrategy}>
                    <div className="bk-swatches">
                      {group.items.map((color) => (
                        <Swatch
                          key={color.id}
                          color={color}
                          fresh={color.id === freshId}
                          copied={color.id === copiedId}
                          wasDragged={() => dragged.current}
                          onCopy={onCopy}
                          onSave={onSave}
                          onDelete={onDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
