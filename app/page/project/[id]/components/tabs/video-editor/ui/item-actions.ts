import { useMemo } from "react";
import { useEditor, useSelectedItem } from "../editor-context";
import { MIN_ITEM_DURATION, itemEnd } from "../model/timeline";

/** Split / duplicate / delete / volume for the selected item, shared by inspector and mobile toolbar. */
export function useItemActions() {
  const { dispatch, playhead, setSelection } = useEditor();
  const selected = useSelectedItem();

  return useMemo(() => {
    if (!selected) return null;
    const { layer, item } = selected;
    const target = { layerId: layer.id, itemId: item.id };
    const canSplit =
      playhead - item.start >= MIN_ITEM_DURATION && itemEnd(item) - playhead >= MIN_ITEM_DURATION;

    return {
      layer,
      item,
      canSplit,
      split: () =>
        dispatch({ type: "split", ...target, time: playhead, newId: crypto.randomUUID() }),
      duplicate: () => {
        const newId = crypto.randomUUID();
        dispatch({ type: "duplicate", ...target, newId });
        setSelection({ layerId: layer.id, itemId: newId });
      },
      remove: () => {
        dispatch({ type: "remove-item", ...target });
        setSelection(null);
      },
      setVolume: (volume: number) => dispatch({ type: "set-volume", ...target, volume }),
      /** Images only: how long the picture stays on screen. */
      setDuration: (seconds: number) =>
        dispatch({ type: "trim", ...target, inPoint: item.inPoint, outPoint: item.inPoint + seconds }),
      hasAudio: item.media !== "image",
      toggleMute: () => dispatch({ type: "toggle-mute", ...target }),
    };
  }, [selected, playhead, dispatch, setSelection]);
}

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${(safe - minutes * 60).toFixed(1).padStart(4, "0")}`;
};
