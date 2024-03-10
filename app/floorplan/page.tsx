"use client";

import dynamic from "next/dynamic";

const DynamicCanvas = dynamic(
  async () => await import("@/components/builder/builder"),
  {
    ssr: false,
  }
);

export default function FloorplanPage() {
  return (
    <DynamicCanvas
      activeFloorPlanId=""
      budget={0}
      setStageItems={() => {}}
      stageItems={[]}
      updateFloorPlans={() => {}}
    />
  );
}
