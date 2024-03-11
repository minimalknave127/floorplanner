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
  const [center, setCenter] = useState<point>({ x: 0, y: 0 });

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
      return { x: 0, y: 0 }; // Or throw an error
    }

    let coords = coordinates;

    if (coords.length > 4) {
      coords = coords.slice(0, -1);
    }

    let sumX = 0,
      sumY = 0;

    console.log("coords", coords);

    for (let i = 0; i < coords.length; i++) {
      sumX += coordinates[i].x;
      sumY += coordinates[i].y;
    }

    return {
      x: sumX / coords.length,
      y: sumY / coords.length,
    };
  }
  useEffect(() => {
    setCenter(calculateCenter(points));
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
  console.log("points", points);
  return (
    <>
      <div className="absolute top-0 left-0 z-10">
        center: {JSON.stringify(center)}
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
          {points.map((p, i) => (
            <Rect
              key={i}
              x={p.x - 5 / 2}
              y={p.y - 5 / 2}
              width={5}
              height={5}
              fill="blue"
            />
          ))}
          {isClosed && (
            <Text
              fill="red"
              width={100}
              height={200}
              align="center"
              x={center?.x - 50}
              y={center?.y - 10}
              text={`Místnost`}
            />
          )}
        </Layer>
      </Stage>
    </>
  );
}
