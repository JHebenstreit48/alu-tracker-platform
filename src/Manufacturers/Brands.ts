import { BrandInfo } from "./interface.ts";
import { Logos } from "../assets/images/logos.ts";

export const abc: BrandInfo[] = [
  {
    letterKey: "A",
    brands: [
      {
        brandsKey: "Acura",
        logo: Logos.Acura,
        info: "Acura is the luxury division of Japanese automaker Honda Motor Company. It was originally referred to as Channel II. The name change to Acura was announced in September of 1984. They did not sell their first vehicles in the US market until March 27th, 1986.",
      },
      {
        brandsKey: "Ajlani Motors",
        logo: Logos.Ajlani,
        info: "Ajlani Motors is a UAE based company founded by Bashar Ajlani a car designer and art director. His first car the Ajlani Drakuma concept was unveiled at the Dubai International Motor Show in November of 2019. Bashar Ajlani has also won multiple 1st place awards for various works. This includes a Platinum position with A Design Award and Competition. He even won a 1st place Masters Scholarship by Pininfarina in automotive design.",
      },
      {
        brandsKey: "Alfa Romeo",
        logo: Logos.AlfaRomeo,
        info: "Alfa Romeo's origins date back to June 24th of 1910. It was the result of a take over of the Italian automobile manufacturer Darracq automobile company. The Alfa portion of the name is an acronym for Anonima Lombarda Fabbrica Automobili (A.L.F.A).",
      }
    ],
  },
  {
    letterKey: "B",
    brands: [
      {
        brandsKey: "BMW",
        // logo: Logos.BMW,
        info: "Bayerische Motoren Werke AG, commonly referred to as BMW, is a German multinational corporation which produces luxury vehicles and motorcycles. The company was founded in 1916 as a manufacturer of aircraft engines, which it produced from 1917 until 1918 and again from 1933 to 1945.",
      },
      {
        brandsKey: "Bugatti",
        // logo: Logos.Bugatti,
        info: "Bugatti is a French car manufacturer and was founded in 1909 in Molsheim, Alsace, France. The company was founded by Italian-born Ettore Bugatti. Bugatti cars were known for their design beauty and for their.",
      },
    ],
  },
];
