import { GarageLevels } from "./interface.ts";
import { Images } from "../assets/images/images";

export const garageLevelList: GarageLevels[] = [
  {
    GarageLevelKey: 1,
    xp: 0,
    garageLevel: [
      {
        img: Images.BMWZ4,
        name: "BMW Z4 LCI E89",
      },
      {
        img: Images.ChevroletCamaroLT,
        name: "Chevrolet Camaro LT",
      },
      {
        img: Images.MitsubishiLancerEvo,
        name: "Mitsubishi Lancer Evo"
      }

    ],
  },
  {
    GarageLevelKey: 2,
    xp: 4000,
    garageLevel: [
      {
        img: Images.BMWZ4,
        name: "BMW Z4 LCI E89",
      },
      {
        img: Images.ChevroletCamaroLT,
        name: "Chevrolet Camaro LT",
      },
      {
        img: Images.BMWZ4,
        name: "BMW Z4 LCI E89",
      },

    ],
  },
  {
    GarageLevelKey: 3,
    xp: 8000,
    garageLevel: [
      {
        img: Images.BMWZ4,
        name: "BMW Z4 LCI E89",
      },
      {
        img: Images.ChevroletCamaroLT,
        name: "Chevrolet Camaro LT",
      },

    ],
  },
];
