import Header from "../components/Header";
import PageTab from "../components/PageTab";
import ImageCarousel from "../HomePage/ImageCarousel";
import Carousel from "../HomePage/ImagesForCarousel";
import GameInfo from "../HomePage/GameInfo";

export default function Home() {

  return (
    <>

      <div>
        
        <PageTab title="Home">
          <Header text="About ALU" />
          <GameInfo />
          <ImageCarousel project={Carousel} />
        </PageTab>

      </div>
      
    </>
  );
}
