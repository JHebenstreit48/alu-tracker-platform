import { ImageCarouselType } from "./ImagesForCarousel";
import '../CSS/Home.css';

type ImageCarouselPropsType = {
  project: ImageCarouselType[];
};

export default function ImageCarousel(props: ImageCarouselPropsType) {
  return (
    <>
      <div
        id="asphalt-carousel-slides"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {props.project.map((image, index) => (
            <div
              className={`carousel-item ${index === 0 ? "active" : ""}`}
              key={index}
            >
              <img src={image.path} className="d-block w-100" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
