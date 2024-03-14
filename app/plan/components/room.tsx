import { Group, Line, Rect, Text } from "react-konva";
import {
  calculateCenter,
  calculateDimensionLines,
  calculateLineLength,
  calculatePolygonArea,
  generateMeasuringLines,
  isConnected,
  // I'm assuming generateMeasuringLines would provide points for dimension lines.
} from "../functions/geometry";
import { mouse, point, room } from "../types/types";
import { lineLength, pointOnLine, polygonWind } from "geometric";
import RoomPoints from "./room-points";
import { useEffect } from "react";
// import { getMeasurementLines } from "../functions/geometryv2";

export default function Room({
  room,
  mouse,
  active,
  changeRoom,
  draw,
}: {
  room: room;
  mouse: mouse;
  active: boolean;
  changeRoom: (room: room) => void;
  draw: boolean;
}) {
  const points = room.points.map((p) => [p.x, p.y]).flat();
  if (active && draw) {
    points.push(mouse.x, mouse.y);
    console.log("yes", points);
  } else {
    console.log("nope", points);
  }
  const isClosed = isConnected(room.points);
  const center = calculateCenter(room.points);
  const area = calculatePolygonArea(room.points, 20);

  // Placeholder for actual dimension points calculation
  const dimensionLines = getOutwardMeasuringLinesWithTextSide(room.points, 20); // Implement this based on your geometry functions
  console.log("dimensionLines", dimensionLines[0]);

  function handleChangePoints(points: point[]) {
    changeRoom({ ...room, points: points });
  }
  console.log("points", points);

  useEffect(() => {
    addEventListener("mousemove", (e: MouseEvent) => {
      if (room.points.length < 2) return;
      // I want this function to be less strict
      const isOnLine = pointOnLine(
        [e.clientX, e.clientY],
        [
          [room.points[0].x, room.points[0].y],
          [room.points[1].x, room.points[1].y],
        ],
        3000
        // { x: room.points[0].x, y: room.points[0].y},
        // { x: room.points[1].x, y: room.points[1].y},
        // { x: e.clientX, y: e.clientY }
      );
      console.log("isOnLine", isOnLine);
    });
  }, [room.points]);

  return (
    <Group>
      <Text text={`points: ${points.length}`} x={50} y={50} />
      <Group>
        <Line
          closed={isClosed}
          fill="#D3D3D3"
          stroke="red"
          strokeWidth={3}
          points={points}
        />
      </Group>
      {/* <Text
        width={100}
        height={10}
        text={`${area}m2`}
        fill="black"
        align="center"
        x={center.x - 50}
        y={center.y - 10 / 2}
      /> */}
      {dimensionLines.map((line, index) => (
        <Group key={index}>
          <Line
            points={[line.start.x, line.start.y, line.end.x, line.end.y]}
            stroke="black"
            strokeWidth={1}
          />
          <Text
            width={70}
            height={10}
            text={
              (calculateLineLength(line.start, line.end, 20) * 625) / 10 + "cm"
            }
            align={line.textSide === "left" ? "left" : "right"}
            fill="black"
            verticalAlign="middle"
            x={
              calculateCenter([
                { x: line.start.x, y: line.start.y },
                { x: line.end.x, y: line.end.y },
              ]).x -
              70 / 2 +
              (line.textSide === "left" ? -20 : 20)
            }
            y={
              calculateCenter([
                { x: line.start.x, y: line.start.y },
                { x: line.end.x, y: line.end.y },
              ]).y -
              10 / 2 +
              (line.textSide === "top" ? -20 : 20)
            }
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
      <RoomPoints
        handleChange={handleChangePoints}
        points={[...room.points, ...(draw && active ? [mouse.x, mouse.y] : [])]}
      />
    </Group>
  );
}

function getOutwardMeasuringLinesWithTextSide(p, offsetDistance) {
  const polygon = polygonWind(p, "ccw");
  if (polygon === null || polygon.length < 3) {
    return [];
  }
  // Function to calculate the normalized normal vector for an edge
  function calculateNormal(p1, p2) {
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const normal = { x: -edge.y, y: edge.x };
    const length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    return { x: normal.x / length, y: normal.y / length };
  }

  // Function to determine on which side to show the text
  function getTextSide(normal) {
    if (Math.abs(normal.x) > Math.abs(normal.y)) {
      return normal.x > 0 ? "right" : "left";
    } else {
      return normal.y > 0 ? "bottom" : "top";
    }
  }

  const offsetLines = polygon.map((vertex, index, arr) => {
    const nextVertex = arr[(index + 1) % arr.length];

    // Calculate the normal for the edge
    const normal = calculateNormal(vertex, nextVertex);

    // Create an offset for the line start and end points, in the direction of the normal
    const lineStart = {
      x: vertex.x + normal.x * offsetDistance,
      y: vertex.y + normal.y * offsetDistance,
    };
    const lineEnd = {
      x: nextVertex.x + normal.x * offsetDistance,
      y: nextVertex.y + normal.y * offsetDistance,
    };

    // Determine on which side to show the text
    const textSide = getTextSide(normal);

    return {
      start: lineStart,
      end: lineEnd,
      textSide: textSide,
    };
  });

  return offsetLines;
}

// best 🥇

function getOutwardMeasuringLines(polygon, offsetDistance) {
  // Function to calculate the normalized normal vector for an edge
  function calculateNormal(p1, p2) {
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const normal = { x: -edge.y, y: edge.x };
    const length = Math.sqrt(normal.x ** 2 + normal.y ** 2);
    return { x: normal.x / length, y: normal.y / length };
  }

  const offsetLines = polygon.map((vertex, index, arr) => {
    const nextVertex = arr[(index + 1) % arr.length];

    // Calculate the normal for the edge
    const normal = calculateNormal(vertex, nextVertex);

    // Create an offset for the line start and end points, in the direction of the normal
    const lineStart = {
      x: vertex.x + normal.x * offsetDistance,
      y: vertex.y + normal.y * offsetDistance,
    };
    const lineEnd = {
      x: nextVertex.x + normal.x * offsetDistance,
      y: nextVertex.y + normal.y * offsetDistance,
    };

    return { start: lineStart, end: lineEnd };
  });

  return offsetLines;
}

function getOffsetMeasuringLines(polygon, offsetDistance) {
  const offsetLines = polygon.map((vertex, index, arr) => {
    const nextVertex = arr[(index + 1) % arr.length];

    // Calculate the edge vector
    const edge = { x: nextVertex.x - vertex.x, y: nextVertex.y - vertex.y };

    // Calculate the length of the edge
    const length = Math.sqrt(edge.x ** 2 + edge.y ** 2);

    // Normalize the edge vector to get the direction
    const direction = { x: edge.x / length, y: edge.y / length };

    // Calculate the perpendicular direction for the offset
    const offsetDir = { x: -direction.y, y: direction.x };

    // Offset the start and end points
    const lineStart = {
      x: vertex.x + offsetDir.x * offsetDistance,
      y: vertex.y + offsetDir.y * offsetDistance,
    };
    const lineEnd = {
      x: nextVertex.x + offsetDir.x * offsetDistance,
      y: nextVertex.y + offsetDir.y * offsetDistance,
    };

    return { start: lineStart, end: lineEnd };
  });

  return offsetLines;
}

function getMeasurementType(direction) {
  // A simple check: if the x component of the direction is larger than the y component,
  // then it's a horizontal measurement. Otherwise, it's vertical.
  return Math.abs(direction.x) > Math.abs(direction.y)
    ? "horizontal"
    : "vertical";
}
