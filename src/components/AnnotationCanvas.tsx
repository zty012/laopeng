"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { debounce } from "lodash";

interface Point {
  x: number;
  y: number;
}

interface Path {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

interface AnnotationCanvasProps {
  pageNumber: number;
  width: number;
  height: number;
  color: string;
  tool: "pen" | "eraser";
  scale: number;
}

export type AnnotationCanvasHandle = {
  clear: () => void;
  undo: () => void;
};

export const AnnotationCanvas = forwardRef<
  AnnotationCanvasHandle,
  AnnotationCanvasProps
>(({ pageNumber, width, height, color, tool, scale }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const isDrawing = useRef(false);
  const currentPath = useRef<Path | null>(null);

  const storageKey = `pdf-annotations-page-${pageNumber}`;

  // Expose clear and undo methods
  useImperativeHandle(ref, () => ({
    clear: () => {
      setPaths([]);
      localStorage.removeItem(storageKey);
    },
    undo: () => {
      setPaths((prev) => {
        const next = prev.slice(0, -1);
        saveToStorage(next);
        return next;
      });
    },
  }));

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPaths(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse annotations", e);
      }
    }
  }, [storageKey]);

  // Save to localStorage with debounce
  const saveToStorage = useCallback(
    debounce((newPaths: Path[]) => {
      localStorage.setItem(storageKey, JSON.stringify(newPaths));
    }, 500),
    [storageKey],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Set display size (css pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    paths.forEach((path) => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x * scale, path.points[0].y * scale);

      if (path.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20 * scale;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width * scale;
      }

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x * scale, path.points[i].y * scale);
      }
      ctx.stroke();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  }, [paths, width, height, scale]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const point = getCoordinates(e);
    currentPath.current = {
      points: [point],
      color: color,
      width: 2,
      isEraser: tool === "eraser",
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !currentPath.current) return;

    // Prevent scrolling when drawing on touch screens
    if ("touches" in e) {
      if (e.cancelable) e.preventDefault();
    }

    const point = getCoordinates(e);
    currentPath.current.points.push(point);

    // Dynamic preview
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (currentPath.current.isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20 * scale;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = currentPath.current.color;
      ctx.lineWidth = currentPath.current.width * scale;
    }

    const pts = currentPath.current.points;
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x * scale, pts[pts.length - 2].y * scale);
      ctx.lineTo(pts[pts.length - 1].x * scale, pts[pts.length - 1].y * scale);
      ctx.stroke();
    }
  };

  const stopDrawing = useCallback(() => {
    if (!isDrawing.current || !currentPath.current) return;
    isDrawing.current = false;
    const newPaths = [...paths, currentPath.current];
    setPaths(newPaths);
    saveToStorage(newPaths);
    currentPath.current = null;
  }, [paths, saveToStorage]);

  // Use passive: false listeners to ensure e.preventDefault() works
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // We don't preventDefault here to allow scrolling if they just tap/swipe fast
        // But we start tracking
        isDrawing.current = true;
        const rect = canvas.getBoundingClientRect();
        const point = {
          x: (e.touches[0].clientX - rect.left) / scale,
          y: (e.touches[0].clientY - rect.top) / scale,
        };
        currentPath.current = {
          points: [point],
          color: color,
          width: 2,
          isEraser: tool === "eraser",
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing.current || !currentPath.current) return;

      // CRITICAL: This stops the page from scrolling while drawing
      if (e.cancelable) e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const point = {
        x: (e.touches[0].clientX - rect.left) / scale,
        y: (e.touches[0].clientY - rect.top) / scale,
      };
      currentPath.current.points.push(point);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (currentPath.current.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20 * scale;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = currentPath.current.color;
        ctx.lineWidth = currentPath.current.width * scale;
      }

      const pts = currentPath.current.points;
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(
          pts[pts.length - 2].x * scale,
          pts[pts.length - 2].y * scale,
        );
        ctx.lineTo(
          pts[pts.length - 1].x * scale,
          pts[pts.length - 1].y * scale,
        );
        ctx.stroke();
      }
    };

    const handleTouchEnd = () => {
      stopDrawing();
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [color, tool, scale, stopDrawing]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-10"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
});

AnnotationCanvas.displayName = "AnnotationCanvas";
