import "../CSS/Page.css";
import "../CSS/Header.css";
import '../CSS/Carousel.css';
import '../CSS/GameAbout.css';
import Header from "../components/Header";
import ImageCarousel from "../HomePage/ImageCarousel";
import Carousel from "../HomePage/ImagesForCarousel";
import GameInfo from "../HomePage/GameInfo";

export default function Home() {
  return (
    <>
      <div>
        <Header text="Asphalt Legends Unite" />
        <GameInfo />
        <ImageCarousel project={Carousel} />
      </div>
    </>
  );
}
