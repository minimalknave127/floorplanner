import { point } from "../types/types";
const turf = require("@turf/turf");

// takes points and returns true or false if the points are connected
export function isConnected(points: point[]) {
  if (points.length < 2) {
    return false;
  }
  const first = points[0];
  const last = points[points.length - 1];
  return first.x === last.x && first.y === last.y;
}

// takes a value and a grid size and returns the value snapped to the grid
export function snapToGrid(value: number, grid: number = 20) {
  return Math.round(value / grid) * grid;
}

// takes a set of points and returns the center point
export function calculateCenter(coordinates: point[]) {
  if (coordinates.length === 0) {
    return { x: 0, y: 0 }; // Or throw an error
  }

  let coords = coordinates;

  if (isConnected(coords)) {
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

export function calculateLineLength(
  start: point,
  end: point,
  gridSize: number
) {
  const x = end.x - start.x;
  const y = end.y - start.y;
  return Math.sqrt(x * x + y * y) / gridSize;
}

// calculate polygon area from a set of points
// must be more than 3 points
export function calculatePolygonArea(points: point[], gridSize: number) {
  // Ensure there are at least 3 points to form a polygon and grid size is positive
  if (points.length < 3 || gridSize <= 0) {
    return 0;
  }

  let area = 0;

  // Loop through each point
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length; // Next vertex

    // Scale points according to grid size and add the cross product of the current and next vertex
    const x1 = points[i].x / gridSize;
    const y1 = points[i].y / gridSize;
    const x2 = points[j].x / gridSize;
    const y2 = points[j].y / gridSize;

    area += x1 * y2;
    area -= x2 * y1;
  }

  // Divide by 2, take absolute value to get the final area
  area = Math.abs(area / 2.0);
  return area;
}

function calculateCentroid(points) {
  let centroid = { x: 0, y: 0 };
  points.forEach((point) => {
    centroid.x += point.x;
    centroid.y += point.y;
  });
  centroid.x /= points.length;
  centroid.y /= points.length;
  return centroid;
}

export function generateMeasuringLines(points, distanceFromWall) {
  const centroid = calculateCentroid(points);
  const lines = [];
  for (let i = 0; i < points.length; i++) {
    const start = points[i];
    const end = points[(i + 1) % points.length];
    const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

    // Calculate the edge vector and its normal
    const edgeVector = { x: end.x - start.x, y: end.y - start.y };
    let normalVector = { x: edgeVector.y, y: -edgeVector.x };

    // Normalize the normal vector
    const length = Math.sqrt(normalVector.x ** 2 + normalVector.y ** 2);
    normalVector.x /= length;
    normalVector.y /= length;

    // Ensure the normal vector points away from the centroid
    const toCentroid = {
      x: centroid.x - midPoint.x,
      y: centroid.y - midPoint.y,
    };
    const dotProduct =
      toCentroid.x * normalVector.x + toCentroid.y * normalVector.y;
    if (dotProduct > 0) {
      // If the dot product is positive, the normal points towards the centroid
      normalVector.x = -normalVector.x;
      normalVector.y = -normalVector.y;
    }

    // Apply the offset
    const offsetStart = {
      x: start.x + normalVector.x * distanceFromWall,
      y: start.y + normalVector.y * distanceFromWall,
    };
    const offsetEnd = {
      x: end.x + normalVector.x * distanceFromWall,
      y: end.y + normalVector.y * distanceFromWall,
    };

    lines.push({ start: offsetStart, end: offsetEnd });
  }
  return lines;
}

function calculateOutwardNormal(edgeStart, edgeEnd, centroid) {
  // Calculate the vector from centroid to the midpoint of the edge
  const midPoint = {
    x: (edgeStart.x + edgeEnd.x) / 2,
    y: (edgeStart.y + edgeEnd.y) / 2,
  };
  const centroidToMid = {
    x: midPoint.x - centroid.x,
    y: midPoint.y - centroid.y,
  };

  // Calculate the edge vector
  const edgeVector = {
    x: edgeEnd.x - edgeStart.x,
    y: edgeEnd.y - edgeStart.y,
  };

  // Calculate the normal vector (perpendicular to the edge)
  let normal = {
    x: -edgeVector.y,
    y: edgeVector.x,
  };

  // Normalize the normal vector
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
  normal = {
    x: normal.x / length,
    y: normal.y / length,
  };

  // Determine if the normal is pointing outwards or inwards
  const dotProduct = normal.x * centroidToMid.x + normal.y * centroidToMid.y;
  if (dotProduct < 0) {
    // If the dot product is negative, the normal is pointing towards the centroid,
    // so we invert the normal to point outwards
    normal = {
      x: -normal.x,
      y: -normal.y,
    };
  }

  return normal;
}

export function calculateDimensionLines(polygon, offsetDistance) {
  // Create a turf polygon from the input coordinates
  const turfPolygon = turf.polygon([polygon]);

  // Get the centroid of the polygon
  const centroid = turf.centroid(turfPolygon);

  // Convert the centroid to a simple point object
  const centroidPoint = {
    x: centroid.geometry.coordinates[0],
    y: centroid.geometry.coordinates[1],
  };

  // Calculate dimension lines for each edge
  const dimensionLines = polygon.map((currentPoint, index, array) => {
    const nextIndex = (index + 1) % array.length;
    const nextPoint = array[nextIndex];

    // Calculate the outward normal vector for the edge
    const normal = calculateOutwardNormal(
      currentPoint,
      nextPoint,
      centroidPoint
    );

    // Calculate the start and end points for the dimension line
    const startPoint = {
      x: currentPoint.x + normal.x * offsetDistance,
      y: currentPoint.y + normal.y * offsetDistance,
    };

    const endPoint = {
      x: nextPoint.x + normal.x * offsetDistance,
      y: nextPoint.y + normal.y * offsetDistance,
    };

    return { start: startPoint, end: endPoint };
  });

  return dimensionLines;
}
