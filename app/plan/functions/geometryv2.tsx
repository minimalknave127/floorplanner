export function getMeasurementLines(points) {
  // Check for valid input
  if (
    points.length < 3 ||
    !Array.isArray(points) ||
    !points.every((point) => point.x !== undefined && point.y !== undefined)
  ) {
    return [];
  }

  const lines = [];
  const centroid = getCentroid(points);

  // Loop through each edge of the polygon
  for (let i = 0; i < points.length; i++) {
    const start = points[i];
    const end = points[(i + 1) % points.length];

    // Get a vector perpendicular to the edge pointing outwards
    const outwardVector = getPerpendicularVector(end, start, centroid);

    // Extend the outward vector by a certain distance (adjust as needed)
    const extension = 100; // Adjust this value to control line length
    const lineEnd = {
      x: end.x + outwardVector.x * extension,
      y: end.y + outwardVector.y * extension,
    };

    lines.push({ start, end: lineEnd });
  }

  return lines;
}

// Function to calculate the centroid of a polygon
function getCentroid(points) {
  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }
  return { x: sumX / points.length, y: sumY / points.length };
}

// Function to calculate a perpendicular vector
function getPerpendicularVector(point1, point2, referencePoint) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  // Negate and swap to get a perpendicular vector pointing outwards (relative to centroid)
  const outwardVector = {
    x: referencePoint.x < (point1.x + point2.x) / 2 ? dy : -dy,
    y: referencePoint.x < (point1.x + point2.x) / 2 ? -dx : dx,
  };
  return normalizeVector(outwardVector);
}

// Function to normalize a vector to unit length
function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

// Example usage
const polygonPoints = [
  { x: 10, y: 10 },
  { x: 50, y: 20 },
  { x: 40, y: 80 },
  { x: 20, y: 50 },
];

const measurementLines = getMeasurementLines(polygonPoints);
console.log(measurementLines);
