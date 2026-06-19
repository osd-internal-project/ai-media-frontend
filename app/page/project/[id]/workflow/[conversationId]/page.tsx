"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { axiosCore } from "@/app/lib/axios/axios";
import WorkflowServices from "@/app/services/workflow.service";
import WorkflowCanvas from "../../components/tabs/workflow/workflow-canvas";

/**
 * หน้าแคนวาส workflow (nested route ตามแบบ App Router เดิม)
 * path: /page/project/[id]/workflow/[conversationId]
 */
const WorkflowCanvasPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const projectId = String(params?.id ?? "");
  const conversationId = String(params?.conversationId ?? "");

  const workflowService = useMemo(() => WorkflowServices(axiosCore), []);
  const [conversationName, setConversationName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const conversation = await workflowService.getConversation(
          projectId,
          conversationId,
        );
        if (mounted) setConversationName(conversation.name);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [conversationId, projectId, workflowService]);

  const userId = session?.user?.id ?? "";
  const organizationId = session?.user?.organizationId ?? undefined;

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/page/project/${projectId}`)}
        >
          Back
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Spin />
          </div>
        ) : (
          <WorkflowCanvas
            projectId={projectId}
            conversationId={conversationId}
            conversationName={conversationName}
            userId={userId}
            organizationId={organizationId}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvasPage;
