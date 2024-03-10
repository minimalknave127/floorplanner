"use client";

import { useEffect, useMemo, useState } from "react";
import { Layer, Line, Rect, Stage, Text } from "react-konva";
import { Html } from "react-konva-utils";

type point = {
  x: number;
  y: number;
};

function isConnected(points: point[]) {
  if (points.length < 2) {
    return false;
  }
  if (
    points[0].x === points[points.length - 1].x &&
    points[0].y === points[points.length - 1].y
  ) {
    return true;
  }
  return false;
}

const SNAP_DISTANCE = 15;
const GRID = 20;

export default function KonvaScreen() {
  const [points, setPoints] = useState<point[]>([]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [linePos, setLinePos] = useState({ x: 0, y: 0 });
  const [enableDraw, setEnableDraw] = useState(true);

  function snapToGrid(value: number) {
    // Round the value to the nearest multiple of gridSize
    return Math.round(value / GRID) * GRID;
  }

  const isClosed = useMemo(() => {
    const isClosed = isConnected(points);
    if (isClosed) {
      setEnableDraw(false);
    }
    return isClosed;
  }, [points]);

  const flattenPoints = points.flatMap((p) => [p.x, p.y]);

  function calculateAngle(p1: point, p2: point) {
    const radians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return radians * (180 / Math.PI);
  }

  function calculateCenter(coordinates: point[]) {
    if (coordinates.length === 0) {
      return null; // Or throw an error
    }

    let sumX = 0,
      sumY = 0;

    for (let i = 0; i < coordinates.length; i++) {
      sumX += coordinates[i].x;
      sumY += coordinates[i].y;
    }

    return {
      x: sumX / coordinates.length,
      y: sumY / coordinates.length,
    };
  }
  useEffect(() => {
    const angle =
      points.length > 0 ? calculateAngle(mouse, points[points.length - 1]) : 0;
    console.log("angle", angle);
    console.log("mouse", mouse);
    if (
      points?.length > 2 &&
      mouse.x - points[0].x > -SNAP_DISTANCE &&
      mouse.x - points[0].x < SNAP_DISTANCE &&
      mouse.y - points[0].y > -SNAP_DISTANCE &&
      mouse.y - points[0].y < SNAP_DISTANCE
    ) {
      setLinePos({
        x: snapToGrid(points[0].x),
        y: snapToGrid(points[0].y),
      });
      console.log("yes");
    } else {
      console.log("else");
      setLinePos({
        x: snapToGrid(mouse.x),
        y: snapToGrid(mouse.y),
      });
    }
  }, [mouse, points, enableDraw]);
  useEffect(() => {
    if (!enableDraw) return;
    function handleMouseClick(e: MouseEvent) {
      setPoints((prev) => [...prev, linePos]);
    }
    function handleMouseMove(e: MouseEvent) {
      setMouse({
        x: e.clientX,
        y: e.clientY,
      });
    }
    addEventListener("mousemove", handleMouseMove);

    addEventListener("click", handleMouseClick);

    return () => {
      removeEventListener("mousemove", handleMouseMove);
      removeEventListener("click", handleMouseClick);
    };
  }, [linePos, enableDraw]);
  return (
    <>
      <div className="absolute top-0 left-0 z-10">
        center: {JSON.stringify(calculateCenter(points))}
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer draggable>
          <Line
            stroke="red"
            fill="yellow"
            closed={isClosed}
            // draggable
            points={[
              ...flattenPoints,
              ...(enableDraw ? [linePos.x, linePos.y] : []),
            ]}
          />
          <Rect
            x={calculateCenter(points)?.x}
            y={calculateCenter(points)?.y}
            width={4}
            height={4}
            fill="red"
            shadowBlur={10}
          />
          <Text
            fill="red"
            x={calculateCenter(points)?.x}
            y={calculateCenter(points)?.y}
            text={`center: x: ${calculateCenter(points)?.x} y: ${
              calculateCenter(points)?.y
            }`}
          />
        </Layer>
      </Stage>
    </>
  );
}
