"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { DesignPage } from "../types";

export function PageThumbnails({
  pages,
  selectedPage,
  setSelectedPage,
  removePage,
}: {
  pages: DesignPage[];
  selectedPage: number;
  setSelectedPage: (index: number) => void;
  removePage: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {pages.map((pg, idx) => (
        <div
          key={idx}
          className={`cursor-pointer rounded border ${idx === selectedPage ? "border-celebrity-purple" : "border-celebrity-gray-200"}`}
          onClick={() => setSelectedPage(idx)}
        >
          <div
            style={{
              width: 120,
              height: 200,
              ...(pg.background?.type === "image"
                ? {
                    backgroundImage: `url(${pg.background?.value})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { background: pg.background?.value || "#ffffff" }),
            }}
          />
          <div className="p-2 flex items-center justify-between text-xs">
            <span>Página {idx + 1}</span>
            <button
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                removePage(idx);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}