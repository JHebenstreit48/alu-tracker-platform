// Import carousel type
export type ImageCarouselType = {
    path: string;
  };
  
  // ✅ NEW: use VITE_PUBLIC_BASE_URL instead of VITE_API_BASE_URL
  const backendImageUrl = import.meta.env.VITE_PUBLIC_BASE_URL ?? "http://localhost:3001";

  
  const Carousel: ImageCarouselType[] = [
    { path: `${backendImageUrl}/images/cars/P/Pagani/pagani-huayra-bc.jpg` },
    { path: `${backendImageUrl}/images/cars/L/Lamborghini/lamborghini-huracan-evo-spyder.jpg` },
    { path: `${backendImageUrl}/images/cars/M/McLaren/mclaren-speedtail.jpg` },
    { path: `${backendImageUrl}/images/cars/L/Lamborghini/lamborghini-sian-fkp-37.jpg` },
    { path: `${backendImageUrl}/images/cars/A/Apex/apex-ap-0.jpg` },
    { path: `${backendImageUrl}/images/cars/A/AstonMartin/aston-martin-valhalla-concept-car.jpg` },
    { path: `${backendImageUrl}/images/cars/L/Lamborghini/lamborghini-sesto-elemento.jpg` },
    { path: `${backendImageUrl}/images/cars/F/Ferrari/ferrari-fxx-k.jpg` },
    { path: `${backendImageUrl}/images/cars/V/Vanda/vanda-electrics-dendrobium.jpg` },
    { path: `${backendImageUrl}/images/cars/P/Porsche/porsche-911-gt3-rs.jpg` },
    { path: `${backendImageUrl}/images/cars/B/Bugatti/bugatti-chiron.jpg` },
    { path: `${backendImageUrl}/images/cars/M/McLaren/mclaren-p1.jpg` },
    { path: `${backendImageUrl}/images/cars/K/Koenigsegg/koenigsegg-regera.jpg` },
    { path: `${backendImageUrl}/images/cars/R/Rimac/rimac-concept-one.jpg` },
    { path: `${backendImageUrl}/images/cars/F/Ferrari/ferrari-laferrari.jpg` },
    { path: `${backendImageUrl}/images/cars/L/Lamborghini/lamborghini-centenario.jpg` },
    { path: `${backendImageUrl}/images/cars/A/AstonMartin/aston-martin-valkyrie.jpg` },
    { path: `${backendImageUrl}/images/cars/A/AutomobiliPininfarina/automobili-pininfarina-battista.jpg` },
    { path: `${backendImageUrl}/images/cars/B/Bugatti/bugatti-veyron-16-4-grand-sport-vitesse.jpg` },
  ];
  
  export default Carousel;
  