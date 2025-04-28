import { ImageCarouselType } from "@/HomePage/ImagesForCarousel";

type ImageCarouselPropsType = {
  project: ImageCarouselType[];
};

export default function ImageCarousel({ project }: ImageCarouselPropsType) {
  return (
    <div id="asphalt-carousel-slides" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {project.map((image, index) => (
          <div
            className={`carousel-item ${index === 0 ? "active" : ""}`}
            key={index}
          >
            {image.path && (
              <img
                src={image.path}
                alt={`Car Image ${index + 1}`}
                className="d-block w-100"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
