import { Circle, Group } from "react-konva";
import { point } from "../types/types";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useState } from "react";
import { snapToGrid } from "../functions/geometry";

const POINT_SIZE = 10;

export default function RoomPoints({
  points,
  handleChange,
}: {
  points: point[];
  handleChange: (points: point[]) => void;
}) {
  const [drag, setDrag] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  function handleDrag(e: KonvaEventObject<MouseEvent>, index: number) {
    if (!drag) return;
    console.log("draggind");
    handleChange(
      points.map((p, i) => {
        if (i === index) {
          return { x: e.evt.clientX, y: e.evt.clientY };
        }
        return p;
      })
    );
  }
  useEffect(() => {
    if (drag) {
      const handleMouseMove = (e: MouseEvent) => {
        console.log("points length", points.length);
        handleChange(
          points.map((p, i) => {
            if (i === activePoint) {
              return { x: e.clientX, y: e.clientY };
            }
            return p;
          })
        );
        // Convert mouse coordinates to Konva's coordinate space if needed
        // Then call your existing handleDrag logic here
      };
      const handleMouseUp = () => {
        setDrag(false);
        setActivePoint(null);
        // add points to grid
        handleChange(
          points.map((p) => {
            return { x: snapToGrid(p.x), y: snapToGrid(p.y) };
          })
        );
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [drag, points, handleChange, activePoint]); // Include any other dependencies
  return (
    <Group>
      {points.map((p, index) => (
        <Group key={index}>
          <Circle
            // draggable
            onMouseEnter={() => setActivePoint(index)}
            onMouseLeave={() => {
              if (!drag) {
                setActivePoint(null);
              }
            }}
            onMouseDown={() => setDrag(true)}
            onMouseUp={() => setDrag(false)}
            // onMouseMove={(e) => handleDrag(e, index)}
            x={p.x}
            y={p.y}
            width={POINT_SIZE + (activePoint === index ? 5 : 0)}
            height={POINT_SIZE + (activePoint === index ? 5 : 0)}
            radius={5}
            fill="blue"
          />
        </Group>
      ))}
    </Group>
  );
}
