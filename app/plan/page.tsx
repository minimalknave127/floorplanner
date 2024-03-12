"use client";

import { useEffect, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage } from "react-konva";
import { mouse, room, roomObject } from "./types/types";
import { isConnected, snapToGrid } from "./functions/geometry";
import Grid from "./components/grid";
import Room from "./components/room";
import DrawingCursor from "./components/drawing-cursor";

export default function PlanPage() {
  const [rooms, setRooms] = useState<room[]>([]);
  const [draw, setDraw] = useState(false);
  const [mouse, setMouse] = useState<mouse>({ x: 0, y: 0 });
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [objects, setObjects] = useState<roomObject[]>([]);

  console.log("rooms", rooms);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: snapToGrid(e.clientX), y: snapToGrid(e.clientY) });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d") {
        setDraw((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCurrentRoomId(null);
      }
    };
    const handleMouseClick = (e: MouseEvent) => {
      if (!draw) return;

      console.log("new room!");
      if (currentRoomId === null) {
        setRooms((prev) => [
          ...prev,
          {
            name: `Room ${prev.length + 1}`,
            points: [{ x: snapToGrid(e.clientX), y: snapToGrid(e.clientY) }],
          },
        ]);
        setCurrentRoomId(rooms.length);
      } else {
        setRooms((prev) => {
          const newRooms = prev.slice();
          console.log("newRooms", newRooms);
          newRooms[currentRoomId].points.push({
            x: snapToGrid(e.clientX),
            y: snapToGrid(e.clientY),
          });
          if (
            currentRoomId !== null &&
            isConnected(newRooms[currentRoomId].points)
          ) {
            setCurrentRoomId(null);
          }
          return newRooms;
        });
      }
    };

    window.addEventListener("click", handleMouseClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleMouseClick);
    };
  }, [draw, currentRoomId]);
  return (
    <main>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Grid />
        <Layer draggable>
          {rooms.map((room, i) => (
            <Room room={room} mouse={mouse} active={currentRoomId === i} />
          ))}
        </Layer>
        {draw && <DrawingCursor mouse={mouse} />}
      </Stage>
    </main>
  );
}
