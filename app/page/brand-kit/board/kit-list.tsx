"use client";

import React from "react";
import { Button, Popconfirm } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
} from "@ant-design/icons";
import type { TBrandKit } from "@/app/common/brand-kit";
import { countLabel } from "../helpers/countLabel";
import { colorsOf, fontsOf } from "./model";

type Props = {
  kits: TBrandKit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (kit: TBrandKit) => void;
  onDelete: (kit: TBrandKit) => void;
};

/** The organization's kits. Each row carries its own palette, so a kit is recognized by colour before name. */
export default function KitList({
  kits,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <nav className="bk-list" aria-label="Brand kits">
      <div className="bk-list-head">
        <h1 className="bk-list-title">Brand Kits</h1>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          aria-label="New brand kit"
          onClick={onCreate}
        />
      </div>
      <ul className="bk-kits">
        {kits.map((kit) => {
          const colors = colorsOf(kit);
          const isDefault = Boolean(kit.isDefault ?? kit.default);
          return (
            <li
              key={kit.id}
              className="bk-kit"
              data-selected={kit.id === selectedId}
            >
              <button
                type="button"
                className="bk-kit-main"
                aria-current={kit.id === selectedId ? "true" : undefined}
                onClick={() => onSelect(kit.id)}
              >
                <span className="bk-kit-name">
                  {isDefault && (
                    <StarFilled className="bk-star" aria-label="Default kit" />
                  )}
                  <span>{kit.name}</span>
                </span>
                <span
                  className="bk-kit-bar"
                  data-empty={colors.length === 0}
                  aria-hidden="true"
                >
                  {colors.map((color) => (
                    <i key={color.id} style={{ background: color.hex }} />
                  ))}
                </span>
                <span className="bk-kit-meta">
                  {countLabel(colors.length, "color")},{" "}
                  {countLabel(fontsOf(kit).length, "font")}
                </span>
              </button>
              <span className="bk-kit-actions">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  aria-label={`Rename ${kit.name}`}
                  onClick={() => onEdit(kit)}
                />
                <Popconfirm
                  title={`Delete ${kit.name}?`}
                  description="Its colors and fonts are deleted with it."
                  okText="Delete kit"
                  okButtonProps={{ danger: true }}
                  cancelText="Keep kit"
                  onConfirm={() => onDelete(kit)}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${kit.name}`}
                  />
                </Popconfirm>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
