import Header from "@/components/Header";
import PageTab from "@/components/PageTab";
import ImageCarousel from "@/HomePage/ImageCarousel";
import Carousel from "@/HomePage/ImagesForCarousel";
import GameInfo from "@/HomePage/GameInfo";
import '@/SCSS/PageAndHome/Home.scss';

export default function Home() {
  return (
    <div>
      <PageTab title="Home">
        <Header text="Asphalt Legends Unite Tracker" />
        <GameInfo />
        <ImageCarousel project={Carousel} /> {/* ✅ Using updated Carousel */}
      </PageTab>
    </div>
  );
}
