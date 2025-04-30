import Header from "@/components/Shared/Header";
import PageTab from "@/components/Shared/PageTab";
import ImageCarousel from "@/components/HomePage/ImageCarousel";
import Carousel from "@components/HomePage/ImagesForCarousel";
import GameInfo from "@components/HomePage/GameInfo";
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
