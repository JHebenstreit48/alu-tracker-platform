import "../CSS/Page.css";
import "../CSS/Header.css";
import '../CSS/Carousel.css'
import Header from "../components/Header";
import ImageCarousel from "../HomePage/ImageCarousel";
import Carousel from "../components/ImagesForCarousel";

export default function Home() {
  return (
    <>
      <div>
        <Header text="Asphalt Legends Unite" />
        <ImageCarousel project={Carousel} />
      </div>
    </>
  );
}
