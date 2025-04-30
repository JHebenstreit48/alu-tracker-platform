// src/GarageLevels/interface.ts

export interface Car {
  brand: string;
  model: string;
  image: string;
}

export interface GarageLevelsInterface {
  GarageLevelKey: number;
  xp: number;
  cars: Car[];
}
