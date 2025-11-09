export type CarSeed = {
    brand: string;
    model: string;
    image: string;
  };
  
  export type LevelSeed = {
    GarageLevelKey: number;
    xp: number;
    cars: CarSeed[];
  };
  
  export type LevelDoc = {
    GarageLevelKey: number;
    xp: number;
    cars: CarSeed[];
  };
  
  export const asArray = <T>(x: unknown): T[] =>
    Array.isArray(x)
      ? (x as T[])
      : x && typeof x === "object"
      ? [x as T]
      : [];  