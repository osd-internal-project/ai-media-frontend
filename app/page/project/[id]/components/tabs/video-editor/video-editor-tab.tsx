"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

/** Keeps MediaBunny out of the project page bundle until the tab is opened. */
const VideoEditorTab = dynamic(() => import("./video-editor-space"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center">
      <Spin />
    </div>
  ),
});

export default VideoEditorTab;
