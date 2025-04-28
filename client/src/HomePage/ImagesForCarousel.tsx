export type ImageCarouselType = {
  path: string;
};

const backendImageUrl = import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:3001";

const Carousel: ImageCarouselType[] = [
  { path: `${backendImageUrl}/images/cars/Pagani/pagani-huayra-bc.jpg` },
  { path: `${backendImageUrl}/images/cars/Lamborghini/lamborghini-huracan-evo-spyder.jpg` },
  { path: `${backendImageUrl}/images/cars/McLaren/mclaren-speedtail.jpg` },
  { path: `${backendImageUrl}/images/cars/Lamborghini/lamborghini-sian-fkp-37.jpg` },
  { path: `${backendImageUrl}/images/cars/Apex/apex-ap-0.jpg` },
  { path: `${backendImageUrl}/images/cars/AstonMartin/aston-martin-valhalla-concept-car.jpg` },
  { path: `${backendImageUrl}/images/cars/Lamborghini/lamborghini-sesto-elemento.jpg` },
  { path: `${backendImageUrl}/images/cars/Ferrari/ferrari-fxx-k.jpg` },
  { path: `${backendImageUrl}/images/cars/Vanda/vanda-electrics-dendrobium.jpg` },
  { path: `${backendImageUrl}/images/cars/Porsche/porsche-911-gt3-rs.jpg` },
  { path: `${backendImageUrl}/images/cars/Bugatti/bugatti-chiron.jpg` },
  { path: `${backendImageUrl}/images/cars/McLaren/mclaren-p1.jpg` },
  { path: `${backendImageUrl}/images/cars/Koenigsegg/koenigsegg-regera.jpg` },
  { path: `${backendImageUrl}/images/cars/Rimac/rimac-concept-one.jpg` },
  { path: `${backendImageUrl}/images/cars/Ferrari/ferrari-laferrari.jpg` },
  { path: `${backendImageUrl}/images/cars/Lamborghini/lamborghini-centenario.jpg` },
  { path: `${backendImageUrl}/images/cars/AstonMartin/aston-martin-valkyrie.jpg` },
  { path: `${backendImageUrl}/images/cars/AutomobiliPininfarina/automobili-pininfarina-battista.jpg` },
  { path: `${backendImageUrl}/images/cars/Bugatti/bugatti-veyron-16-4-grand-sport-vitesse.jpg` },
];

export default Carousel;
