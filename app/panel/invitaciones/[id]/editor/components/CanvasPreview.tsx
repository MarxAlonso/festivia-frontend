"use client";

import React, { useMemo } from "react";
import { DesignPage } from "../types";

export function CanvasPreview({ page }: { page?: DesignPage }) {
  const previewStyle = useMemo(
    () => ({
      width: 360,
      height: 640,
      borderRadius: 12,
      overflow: "hidden" as const,
      position: "relative" as const,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
    }),
    []
  );

  const backgroundStyle =
    page?.background?.type === "image"
      ? {
          backgroundImage: `url(${page.background?.value || ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { background: page?.background?.value || "#ffffff" };

  return (
    <div className="celebrity-card p-6 xl:col-span-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-celebrity-gray-900">Vista previa</h3>
      </div>
      <div className="mx-auto" style={previewStyle}>
        <div className="absolute inset-0" style={backgroundStyle} />
        <div className="absolute inset-0">
          {(page?.elements || []).map((el) => {
            const baseStyle: React.CSSProperties = {
              position: "absolute",
              left: el.x || 0,
              top: el.y || 0,
              transform: `rotate(${el.rotation || 0}deg)`,
              zIndex: el.zIndex || 1,
            };
            if (el.type === "text") {
              return (
                <div
                  key={el.id}
                  style={{
                    ...baseStyle,
                    color: el.styles?.color || "#111",
                    fontSize: (el.styles?.fontSize as number) || 16,
                    fontFamily: (el.styles?.fontFamily as string) || "inherit",
                    fontWeight: (el.styles?.fontWeight as any) || 400,
                  }}
                >
                  {el.content || "Texto"}
                </div>
              );
            }
            if (el.type === "image") {
              return (
                <img
                  key={el.id}
                  src={el.src || ""}
                  alt=""
                  style={{
                    ...baseStyle,
                    width: el.width || 100,
                    height: el.height || 100,
                    objectFit: "cover",
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}