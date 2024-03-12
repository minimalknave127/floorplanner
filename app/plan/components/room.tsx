import { Group, Line, Rect, Text } from "react-konva";
import {
  calculateCenter,
  calculateDimensionLines,
  calculatePolygonArea,
  generateMeasuringLines,
  isConnected,
  // I'm assuming generateMeasuringLines would provide points for dimension lines.
} from "../functions/geometry";
import { mouse, point, room } from "../types/types";
import * as geometric from "geometric";

export default function Room({
  room,
  mouse,
  active,
}: {
  room: room;
  mouse: mouse;
  active: boolean;
}) {
  const points = room.points.map((p) => [p.x, p.y]).flat();
  if (active) {
    points.push(mouse.x, mouse.y);
  }
  const isClosed = isConnected(room.points);
  const center = calculateCenter(room.points);
  const area = calculatePolygonArea(room.points, 20);

  // Placeholder for actual dimension points calculation
  const dimensionLines = generateMeasuringLines(room.points, 20); // Implement this based on your geometry functions
  console.log("dimensionLines", dimensionLines[0]);
  return (
    <Group>
      <Line closed={isClosed} fill="#D3D3D3" stroke="red" points={points} />
      <Text
        width={100}
        height={10}
        text={`${area}m2`}
        fill="black"
        align="center"
        x={center.x - 50}
        y={center.y - 10 / 2}
      />
      {dimensionLines.map((line, index) => (
        <Group key={index}>
          <Line
            points={[line.start.x, line.start.y, line.end.x, line.end.y]}
            stroke="black"
            strokeWidth={1}
          />
          {/* <Line points={line.tick1} stroke="black" strokeWidth={1} />
          <Line points={line.tick2} stroke="black" strokeWidth={1} /> */}
          {/* <Text
            text={line.text}
            x={line.textPosition.x}
            y={line.textPosition.y}
            fill="black"
          /> */}
        </Group>
      ))}
    </Group>
  );
}

function createMeasurements(points: point[]) {
  const bigger = geometric.polygonScale(
    points.map((e) => [e.x, e.y]),
    2
  );
  console.log("bigger", bigger);
  //   const res = points
  //     .map((point, i) => {
  //       if (points.length < 2) return null;
  //       const next = points[i + 1];
  //       const distance = geometric.lineLength([
  //         [point.x, point.y],
  //         [next.x, next.y],
  //       ]);
  //       const angle = geometric.lineAngle([
  //         [point.x, point.y],
  //         [next.x, next.y],
  //       ]);
  //       const textPosition = geometric.lineMidpoint([
  //         [point.x, point.y],
  //         [next.x, next.y],
  //       ]);

  //       console.log("angle", angle);

  //       let linePoints = geometric.lineTranslate(
  //         [
  //           [point.x, point.y],
  //           [next.x, next.y],
  //         ],
  //         angle,
  //         -10
  //       );
  //       if (
  //         geometric.lineIntersectsPolygon(
  //           linePoints,
  //           points.map((p) => [p.x, p.y])
  //         )
  //       ) {
  //         linePoints = geometric.lineTranslate(
  //           [
  //             [point.x, point.y],
  //             [next.x, next.y],
  //           ],
  //           angle,
  //           10
  //         );
  //       }
  //       return linePoints;
  //     })
  //     .filter((e) => e != null);
  //   return res;
}
