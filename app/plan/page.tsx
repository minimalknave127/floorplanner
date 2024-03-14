"use client";

import { useEffect, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage } from "react-konva";
import { mouse, room, roomObject } from "./types/types";
import { isConnected, snapToGrid } from "./functions/geometry";
import Grid from "./components/grid";
import Room from "./components/room";
import DrawingCursor from "./components/drawing-cursor";
import { KonvaEventObject } from "konva/lib/Node";

const ENABLE_ZOOM = false;
const ENABLE_MOVE = false;

export default function PlanPage() {
  const [rooms, setRooms] = useState<room[]>([]);
  const [draw, setDraw] = useState(false);
  const [mouse, setMouse] = useState<mouse>({ x: 0, y: 0 });
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [objects, setObjects] = useState<roomObject[]>([]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  const handleMouseClick = (e: KonvaEventObject<MouseEvent>) => {
    if (!draw) return;
    let closed = false;
    if (currentRoomId === null) {
      setRooms((prev) => [
        ...prev,
        {
          name: `Room ${prev.length + 1}`,
          id: prev.length,
          points: [
            { x: snapToGrid(e.evt.clientX), y: snapToGrid(e.evt.clientY) },
          ],
        },
      ]);
      setCurrentRoomId(rooms.length);
    } else {
      console.log("clicked 2");
      const newRooms = rooms.map((room, index) => {
        if (index === currentRoomId) {
          if (
            room.points.length > 2 &&
            isConnected([
              ...room.points,
              {
                x: snapToGrid(e.evt.clientX),
                y: snapToGrid(e.evt.clientY),
              },
            ])
          ) {
            closed = true;
          }
          return {
            ...room,
            points: [
              ...room.points,
              {
                x: snapToGrid(e.evt.clientX),
                y: snapToGrid(e.evt.clientY),
              },
            ],
          };
        }
        return room;
      });
      // setCurrentRoomId(rooms.length);
      if (closed) setCurrentRoomId(null);
      setRooms(newRooms);
    }
    console.log("clicked");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d") {
        setDraw((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCurrentRoomId(null);
      }
    };

    // window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      // window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [draw, currentRoomId]);
  function handleZoom(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    if (!ENABLE_ZOOM) return;
    const scaleBy = 1.02;

    const stage = e.currentTarget.getStage();
    if (stage === null) return;
    const oldScale = stage?.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  }
  function handleChangeRoom(room: room) {
    setRooms((prev) => {
      const newRooms = prev.slice();
      newRooms[room.id] = room;
      return newRooms;
    });
  }
  return (
    <main>
      <Stage
        onClick={handleMouseClick}
        onPointerMove={(e) => {
          if (draw) {
            setMouse({
              x: snapToGrid(e.evt.clientX),
              y: snapToGrid(e.evt.clientY),
            });
          }
        }}
        onWheel={handleZoom}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={ENABLE_MOVE}
      >
        <Grid />
        <Layer>
          {rooms.map((room, i) => (
            <Room
              draw={draw}
              changeRoom={handleChangeRoom}
              room={room}
              mouse={mouse}
              active={currentRoomId === i}
            />
          ))}
        </Layer>
        {draw && <DrawingCursor mouse={mouse} />}
      </Stage>
    </main>
  );
}
