"use client";
import { useState, useMemo } from "react";
import { Button, Input, Tooltip, Typography, theme } from "antd";
import { MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import type { Conversation } from "@/app/services/chat-assistant.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

/** Group conversations by Today / Yesterday / Older */
const groupByDate = (conversations: Conversation[]) => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Older", items: [] },
  ];

  for (const conv of conversations) {
    const d = dayjs(conv.createdAt).startOf("day");
    if (d.isSame(today)) groups[0].items.push(conv);
    else if (d.isSame(yesterday)) groups[1].items.push(conv);
    else groups[2].items.push(conv);
  }

  return groups.filter((g) => g.items.length > 0);
};

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  onDelete,
  loading,
}: ConversationListProps) => {
  const { token } = theme.useToken();
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      search.trim()
        ? conversations.filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase())
          )
        : conversations,
    [conversations, search]
  );

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="flex h-full flex-col">
      {/* New Chat */}
      <div className="p-3 pb-2">
        <Button
          type="primary"
          block
          icon={<Plus className="h-4 w-4" />}
          onClick={onNewChat}
          style={{ borderRadius: "0.75rem", boxShadow: "none" }}
          loading={loading}
        >
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <Input
          prefix={
            <Search className="h-4 w-4" style={{ color: token.colorTextSecondary }} />
          }
          placeholder="Search conversations..."
          variant="filled"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: "0.75rem" }}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-4">
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <MessageSquare className="h-8 w-8" style={{ color: token.colorTextQuaternary }} />
            <Text type="secondary" className="text-xs text-center">
              {search ? "No results found" : "No conversations yet"}
            </Text>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <Text
              type="secondary"
              className="mb-1.5 block px-2 text-xs font-semibold uppercase tracking-wider"
            >
              {group.label}
            </Text>

            <div className="space-y-0.5">
              {group.items.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isHov = hovered === conv.id;

                return (
                  <div
                    key={conv.id}
                    className="relative flex items-center rounded-xl px-3 py-2.5 cursor-pointer transition-colors group"
                    style={{
                      backgroundColor: isActive
                        ? token.colorPrimaryBg
                        : isHov
                        ? token.colorFillAlter
                        : "transparent",
                    }}
                    onMouseEnter={() => setHovered(conv.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelect(conv.id)}
                  >
                    <div className="flex-1 min-w-0 pr-6">
                      <p
                        className="truncate text-sm font-medium"
                        style={{
                          color: isActive ? token.colorPrimary : token.colorTextBase,
                        }}
                      >
                        {conv.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: token.colorTextTertiary }}>
                        {dayjs(conv.updatedAt ?? conv.createdAt).fromNow()}
                        {conv._count?.messages ? ` · ${conv._count.messages} msgs` : ""}
                      </p>
                    </div>

                    {/* Delete button */}
                    {(isHov || isActive) && (
                      <Tooltip title="Delete">
                        <button
                          className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg transition-colors"
                          style={{ color: token.colorTextSecondary }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length > 0 && (
          <div className="text-center pt-2">
            <Text type="secondary" className="text-xs">
              No more to load
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
