export type BackgroundType = "image" | "color";

export type PageElement = {
  id: string;
  type: "text" | "image" | "shape";
  content?: string;
  src?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  styles?: Record<string, any>;
};

export type DesignPage = {
  background?: { type: BackgroundType; value: string };
  sections?: { key: "header" | "body" | "footer"; text: string }[];
  elements?: PageElement[];
};