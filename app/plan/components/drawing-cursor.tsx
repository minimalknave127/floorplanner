import { Circle, Layer } from "react-konva";
import { mouse } from "../types/types";

export default function DrawingCursor({ mouse }: { mouse: mouse }) {
  return (
    <Layer>
      <Circle
        x={mouse.x}
        y={mouse.y}
        width={10}
        height={10}
        fill="red"
        draggable
      />
    </Layer>
  );
}
