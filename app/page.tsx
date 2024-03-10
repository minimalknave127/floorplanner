"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Line } from "@react-three/drei";

const App = () => {
  return (
    <div className="w-full h-screen bg-red-500">
      <Canvas className="w-full h-screen ">
        <ambientLight />
        <directionalLight position={[10, 10, 5]} />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="pink" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default App;
