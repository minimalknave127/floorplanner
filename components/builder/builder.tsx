/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";
import * as Popover from "@radix-ui/react-popover";
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Circle, Line, Group } from "react-konva";
// import type Konva from "konva";
import { Button } from "../ui/button";
// import { ArrowCounterClockwise } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { Label } from "../ui/label";
import {
  Pen,
  ArrowBigDownIcon as ArrowCounterClockwise,
  ExpandIcon as Export,
} from "lucide-react";
import { Input } from "../ui/input";
// import { Export } from '@phosphor-icons/react/dist/csr/Export'
import { useRouter } from "next/navigation";
import { StageItem } from "./Item";
import { Html } from "react-konva-utils";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@radix-ui/react-popover'

interface BuildCanvasProps {
  activeFloorPlanId: string;
  updateFloorPlans: () => Promise<void>;
  stageItems: [];
  setStageItems: (items: any[]) => void;
  budget: number;
}

const BuildCanvas: React.FC<BuildCanvasProps> = (props) => {
  // const supabase = createClient();

  // const { data, error } = await supabase.auth.getUser()

  const router = useRouter();

  const [currentFloorPlanState, setCurrentFloorPlanState] =
    useState<IFloorPlan>({});

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { activeFloorPlanId, updateFloorPlans } = props;

  const divRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isCircleVisible, setIsCircleVisible] = useState<boolean>(true);
  const [cursor, setCursor] = useState<ICoord>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tempLine, setTempLine] = useState<ILine | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const walls = currentFloorPlanState?.structure?.walls ?? ([] as ILine[]);

  const isWallEnds = (): boolean => {
    return walls.some((wall) => {
      return (
        (wall?.start.x === cursor.x && wall?.start.y === cursor.y) ||
        (wall?.end.x === cursor.x && wall?.end.y === cursor.y)
      );
    });
  };

  const fetchFloorPlan = async (): Promise<void> => {
    setCurrentFloorPlanState(null);
  };

  const handleDragEnd = (index, e) => {
    // addToHistory();
    const newShapes = [...props.stageItems];
    newShapes[index] = {
      ...newShapes[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    props.setStageItems(newShapes);
  };

  const handleRotation = (index, e) => {
    const newShapes = [...props.stageItems];
    newShapes[index] = {
      ...newShapes[index],
      rotation: e.target.attrs.rotation,
    };
    props.setStageItems(newShapes);
    // addToHistory();
  };

  const dragBoundFunc = (pos) => ({
    x: Math.max(0, Math.min(pos.x, canvasDimensions.width)),
    y: Math.max(0, Math.min(pos.y, canvasDimensions.height)),
  });

  useEffect(() => {
    if (false) {
    }
    // console.log(currentFloorPlanState)
  }, [currentFloorPlanState]);

  useEffect(() => {
    fetchFloorPlan();
  }, [activeFloorPlanId]);

  useEffect(() => {
    const updateDimensions = (): void => {
      setCanvasDimensions({
        width: divRef.current?.clientWidth ?? 0,
        height: divRef.current?.clientHeight ?? 0,
      });
      console.log(divRef.current?.clientHeight);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const handleCanvasMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    if (
      e.target.attrs.name === "item" ||
      e.target.attrs.name === "rotater _anchor"
    ) {
      return;
    }
    setSelectedIndex(null);
    setIsDrawing(true);
    setTempLine({ start: cursor, end: cursor });
  };

  const handleCanvasMouseUp = (e: Konva.KonvaEventObject<MouseEvent>): void => {
    if (
      e.target.attrs.name !== "item" &&
      tempLine !== null &&
      JSON.stringify(tempLine.start) !== JSON.stringify(cursor)
    ) {
      //   addToHistory();
      setCurrentFloorPlanState((oldFloorPlan) => {
        if (oldFloorPlan == null) {
          // Handle the case where oldFloorPlan is null
          // You might want to return a default IFloorPlan object here
          return null;
        }
        return {
          ...oldFloorPlan,
          structure: {
            ...oldFloorPlan.structure,
            walls: [...oldFloorPlan.structure.walls, tempLine],
          },
        };
      });
      // setWalls((prevWalls) => );
    }

    // Reset line start and end points
    setIsDrawing(false);
    setTempLine(null);
  };

  const handleCanvasMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): void => {
    const stage = e.target?.getStage();
    const mousePos = stage?.getPointerPosition();

    // Calculate the nearest grid snap positions
    const snappedX = Math.round((mousePos?.x ?? 0) / 10) * 10 + 1;
    const snappedY = Math.round((mousePos?.y ?? 0) / 10) * 10 + 1;
    setCursor({ x: snappedX, y: snappedY });

    if (isDrawing && tempLine !== null) {
      setTempLine({ start: tempLine.start, end: cursor });
    }
  };

  const handleMouseEnter = (): void => {
    setIsCircleVisible(true);
  };

  const handleMouseLeave = (): void => {
    setIsCircleVisible(false);
    setIsDrawing(false);
    setTempLine(null);
  };
  const handleRemoveStageItem = (index) => {
    props.setStageItems((currentShapes) =>
      currentShapes.filter((_, i) => i !== index)
    );
  };

  const undo = (): void => {
    setCurrentFloorPlanState((oldFloorPlan) => {
      if (oldFloorPlan == null) {
        // Handle the case where oldFloorPlan is null
        // You might want to return a default IFloorPlan object here
        return {};
      }
      if (walls.length === 1) setMeterToPixel(null);
      return {
        ...oldFloorPlan,
        structure: {
          ...oldFloorPlan.structure,
          walls: oldFloorPlan.structure?.walls.slice(0, -1),
        },
      };
    });
    // handleFloorPlanUpdate();
    // setWalls(walls.slice(0, -1));
  };

  const share = (): void => {
    router.push(`/f/${activeFloorPlanId}`);
  };

  // const [scaleInputOpen, setScaleInputOpen] = useState(false)
  const [meterToPixel, setMeterToPixel] = useState<number | null>(null); // 1 cm * scale = pixel

  const createScale = (): void => {
    if (walls.length === 0) return;
    const xDist = walls[0].end.x - walls[0].start.x;
    const yDist = walls[0].end.y - walls[0].start.y;
    const wallLengthInPixels = Math.sqrt(
      Math.pow(xDist, 2) + Math.pow(yDist, 2)
    );

    const newMtoPixel =
      wallLengthInPixels /
      parseFloat(prompt("Enter the length of the red wall in meters") ?? "0");

    setMeterToPixel(newMtoPixel);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-20 max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap">
        {!isEditing ? (
          <div className="flex flex-row items-center gap-2">
            <Label className="max-w-[150px] overflow-hidden">
              {currentFloorPlanState?.name}
            </Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              // color="black"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Pen size={16} />
            </Button>
          </div>
        ) : (
          <Input
            autoFocus
            className="bg-transparent cursor-pointer border-0 border-b rounded-none h-7"
            autoComplete="off"
            value={currentFloorPlanState?.name}
            onChange={(e) => {
              setCurrentFloorPlanState({
                ...currentFloorPlanState,
                name: e.target.value.slice(0, 20),
              });
            }}
            onBlur={() => {
              setIsEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setIsEditing(false);
              }
            }}
            maxLength={20}
          />
        )}
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-row items-center gap-2">
        <div className="flex ">
          {/* <Input
            className="mr-3 w-[130px] text-sm"
            placeholder="Length (cm)"
          ></Input> */}
          <Button variant={"outline"} size={"sm"} onClick={createScale}>
            Set Scale
          </Button>
        </div>
        {/* <Button variant={'outline'} size={'sm'} onClick={screenshot}>
          Save as PNG
        </Button> */}
        <Button
          // onMouseOver={(e) => {
          //     e.preventDefault();
          //     e.stopPropagation();
          // }}
          variant={"outline"}
          size={"sm"}
          onClick={undo}
        >
          <ArrowCounterClockwise size={18} />
        </Button>
        <Button
          // onMouseOver={(e) => {
          //     e.preventDefault();
          //     e.stopPropagation();
          // }}
          variant={"outline"}
          size={"sm"}
          onClick={share}
        >
          <Export size={18} />
        </Button>
      </div>
      <div className="absolute right-4 top-16 bg-white px-3 py-1 border rounded-sm flex items-center justify-center flex-col">
        <p className="text-xs">Total</p>
        <p className="font-bold">￡{Math.round(props.budget * 100) / 100} 💸</p>
      </div>

      <div
        ref={divRef}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ddd 1px, transparent 0)",
          backgroundSize: "10px 10px",
          width: "100%",
          height: "100%",
          // flex: '1',
          position: "absolute",
          zIndex: "-10",
        }}
      />
      <Stage
        id="yourStageId"
        width={canvasDimensions.width}
        height={canvasDimensions.height - 2}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <Layer>
          {isCircleVisible && (
            <Circle
              radius={6}
              fill={isWallEnds() ? "orange" : "#000"}
              x={cursor.x}
              y={cursor.y}
              name="cursor"
            />
          )}
          {walls.map((wall, index) => {
            return (
              <RenderWall
                wall={wall}
                key={index}
                index={index}
                meterToPixel={meterToPixel}
              />
            );

            // return null
          })}
          {props.stageItems.map((shape, index) => {
            if (shape.type === "item") {
              return (
                <StageItem
                  scale={meterToPixel ? 100 / meterToPixel : 1}
                  key={index}
                  index={index}
                  handleRemoveStageItem={handleRemoveStageItem}
                  product={shape.product}
                  handleDragEnd={handleDragEnd}
                  handleRotation={handleRotation}
                  dragBoundFunc={dragBoundFunc}
                  setSelectedIndex={setSelectedIndex}
                  isSelected={selectedIndex === index}
                  x={shape.x}
                  y={shape.y}
                  rotation={shape.rotation}
                />
              );
            }
            return null;
          })}
          {isDrawing && tempLine !== null && (
            <Line
              points={[
                tempLine.start.x,
                tempLine.start.y,
                tempLine.end.x,
                tempLine.end.y,
              ]}
              stroke="gray"
              dash={[10, 10]}
              strokeWidth={5}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default BuildCanvas;

export const RenderWall = ({ index, wall, meterToPixel }: any) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const getLengthInMeters = () => {
    const x_dist = wall.end.x - wall.start.x;
    const y_dist = wall.end.y - wall.start.y;
    const wallLengthInPixels = Math.sqrt(
      Math.pow(x_dist, 2) + Math.pow(y_dist, 2)
    );

    const res = wallLengthInPixels / meterToPixel;
    return Math.round(res * 100) / 100;
  };

  return (
    <>
      <Group>
        <Line
          // key={index}
          points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
          stroke={meterToPixel === null && index === 0 ? "red" : "#222"}
          lineCap="round"
          // dash={[10, 10]}
          strokeWidth={8}
        />
        {meterToPixel && (
          <Group
            x={(wall.end.x + wall.start.x) / 2 + 8}
            y={(wall.end.y + wall.start.y) / 2}
          >
            {/* <Html
              divProps={{
                style: {
                  pointerEvents: "none",
                },
              }}
            >
              <div>{getLengthInMeters()}</div>
            </Html> */}
          </Group>
        )}
      </Group>
    </>
    // <Popover.Root open={true}>
    //   <Popover.Trigger asChild>

    //   </Popover.Trigger>
    //   <Popover.Portal>
    //     <Popover.Content
    //       className="PopoverContent"
    //       sideOffset={5}
    //     ></Popover.Content>
    //   </Popover.Portal>
    // </Popover.Root>
  );
};
