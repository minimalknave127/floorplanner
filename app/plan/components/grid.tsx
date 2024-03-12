import { Layer, Line } from "react-konva";

export default function Grid() {
  return (
    <Layer>
      {Array.from({ length: window.innerWidth / 20 }, (_, i) => (
        <Line
          key={i}
          points={[i * 20, 0, i * 20, window.innerHeight]}
          stroke="#ECECEC"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: window.innerHeight / 20 }, (_, i) => (
        <Line
          key={i}
          points={[0, i * 20, window.innerWidth, i * 20]}
          stroke="#ECECEC"
          strokeWidth={1}
        />
      ))}
    </Layer>
  );
}
