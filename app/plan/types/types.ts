export type mouse = {
  x: number;
  y: number;
};

export type point = {
  x: number;
  y: number;
};

export type room = {
  points: point[];
  name: string;
  id: number;
};

export type roomObject = {
    type: "window" | "door";
    points: point[];
    name: string;
    };
}
