import {
  clampVolume,
  itemEnd,
  layerDuration,
  placeItem,
  splitItem,
  trimInPlace,
} from "./timeline";
import type { AspectRatio, EditorProject, Layer, TimelineItem } from "./types";

export const HISTORY_LIMIT = 50;

export interface EditorState {
  past: EditorProject[];
  present: EditorProject;
  future: EditorProject[];
}

/** Ids are created by the caller so the reducer stays pure and testable. */
export type EditorAction =
  | { type: "load"; project: EditorProject }
  | { type: "add-layer"; layer: Layer }
  | { type: "add-item"; layerId: string; item: TimelineItem }
  | { type: "remove-item"; layerId: string; itemId: string }
  | { type: "place"; layerId: string; itemId: string; start: number }
  | { type: "trim"; layerId: string; itemId: string; inPoint: number; outPoint: number }
  | { type: "split"; layerId: string; itemId: string; time: number; newId: string }
  | { type: "duplicate"; layerId: string; itemId: string; newId: string }
  | { type: "set-volume"; layerId: string; itemId: string; volume: number }
  | { type: "toggle-mute"; layerId: string; itemId: string }
  | { type: "set-aspect"; aspect: AspectRatio }
  | { type: "rename"; name: string }
  | { type: "undo" }
  | { type: "redo" };

export const createEditorState = (project: EditorProject): EditorState => ({
  past: [],
  present: project,
  future: [],
});

function withLayer(
  project: EditorProject,
  layerId: string,
  update: (layer: Layer) => Layer,
): EditorProject {
  let changed = false;
  const layers = project.layers.map((layer) => {
    if (layer.id !== layerId) return layer;
    const next = update(layer);
    changed = next !== layer;
    return next;
  });
  return changed ? { ...project, layers } : project;
}

function overlapsOthers(items: TimelineItem[], candidate: TimelineItem): boolean {
  return (
    candidate.start < 0 ||
    items.some(
      (item) =>
        item.id !== candidate.id &&
        candidate.start < itemEnd(item) &&
        item.start < itemEnd(candidate),
    )
  );
}

/**
 * Adds an item at its requested start, or the nearest gap that fits. When nothing fits
 * there it goes after the last item, so an add never silently does nothing.
 */
function insertFree(layer: Layer, item: TimelineItem): Layer {
  const placed = placeItem([...layer.items, item], item.id, item.start);
  const added = placed.find((entry) => entry.id === item.id);
  if (added && !overlapsOthers(placed, added)) return { ...layer, items: placed };
  return { ...layer, items: [...layer.items, { ...item, start: layerDuration(layer) }] };
}

function updateItem(
  layer: Layer,
  itemId: string,
  update: (item: TimelineItem) => TimelineItem | null,
): Layer {
  const index = layer.items.findIndex((item) => item.id === itemId);
  if (index < 0) return layer;
  const next = update(layer.items[index]);
  if (!next) return layer;
  const items = [...layer.items];
  items[index] = next;
  return { ...layer, items };
}

function edit(project: EditorProject, action: EditorAction): EditorProject {
  switch (action.type) {
    case "add-layer":
      return project.layers.some((layer) => layer.id === action.layer.id)
        ? project
        : { ...project, layers: [...project.layers, action.layer] };

    case "add-item":
      return withLayer(project, action.layerId, (layer) => insertFree(layer, action.item));

    case "remove-item":
      // Items keep their places: removing one leaves a gap rather than shifting the rest.
      return withLayer(project, action.layerId, (layer) => {
        const items = layer.items.filter((item) => item.id !== action.itemId);
        return items.length === layer.items.length ? layer : { ...layer, items };
      });

    case "place":
      return withLayer(project, action.layerId, (layer) => {
        const items = placeItem(layer.items, action.itemId, action.start);
        return items === layer.items ? layer : { ...layer, items };
      });

    case "trim":
      return withLayer(project, action.layerId, (layer) =>
        updateItem(layer, action.itemId, (item) =>
          trimInPlace(layer.items, item, action.inPoint, action.outPoint),
        ),
      );

    case "split":
      return withLayer(project, action.layerId, (layer) => {
        const index = layer.items.findIndex((item) => item.id === action.itemId);
        if (index < 0) return layer;
        const halves = splitItem(layer.items[index], action.time, action.newId);
        if (!halves) return layer;
        const items = [...layer.items];
        items.splice(index, 1, ...halves);
        return { ...layer, items };
      });

    case "duplicate":
      return withLayer(project, action.layerId, (layer) => {
        const source = layer.items.find((item) => item.id === action.itemId);
        if (!source) return layer;
        return insertFree(layer, { ...source, id: action.newId, start: itemEnd(source) });
      });

    case "set-volume":
      return withLayer(project, action.layerId, (layer) =>
        updateItem(layer, action.itemId, (item) => ({ ...item, volume: clampVolume(action.volume) })),
      );

    case "toggle-mute":
      return withLayer(project, action.layerId, (layer) =>
        updateItem(layer, action.itemId, (item) => ({ ...item, muted: !item.muted })),
      );

    case "set-aspect":
      return project.aspect === action.aspect ? project : { ...project, aspect: action.aspect };

    case "rename": {
      const name = action.name.slice(0, 100);
      return project.name === name ? project : { ...project, name };
    }

    default:
      return project;
  }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "load":
      return createEditorState(action.project);

    case "undo": {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case "redo": {
      const [next, ...future] = state.future;
      if (!next) return state;
      return { past: [...state.past, state.present], present: next, future };
    }

    default: {
      const present = edit(state.present, action);
      // No-op edits (rejected trims, unknown ids) must not create an undo step.
      if (present === state.present) return state;
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present,
        future: [],
      };
    }
  }
}
