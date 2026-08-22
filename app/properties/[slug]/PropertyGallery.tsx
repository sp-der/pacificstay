"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PropertyGalleryProps = {
  propertyName: string;
  heroImage: string;
  gallery: string[];
};

export default function PropertyGallery({
  propertyName,
  heroImage,
  gallery,
}: PropertyGalleryProps) {
  const images = useMemo(() => [heroImage, ...gallery], [heroImage, gallery]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;

  function openImage(index: number) {
    setActiveIndex(index);
  }

  function closeViewer() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, images.length]);

  return (
    <>
      <section
        className="property-gallery property-shell interactive-property-gallery"
        aria-label={`${propertyName} gallery`}
      >
        <button
          type="button"
          className="property-gallery-main property-gallery-button"
          onClick={() => openImage(0)}
          aria-label={`Open ${propertyName} photo 1 of ${images.length}`}
        >
          <img src={heroImage} alt={`${propertyName} exterior`} />
          <span className="gallery-open-hint"><Images size={16} /> View photos</span>
        </button>

        <div className="property-gallery-side">
          {gallery.map((image, index) => (
            <button
              type="button"
              className="property-gallery-button"
              key={image}
              onClick={() => openImage(index + 1)}
              aria-label={`Open ${propertyName} photo ${index + 2} of ${images.length}`}
            >
              <img src={image} alt={`${propertyName} gallery photo ${index + 2}`} />
            </button>
          ))}
        </div>
      </section>

      {activeIndex !== null && (
        <div
          className="property-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${propertyName} photo viewer`}
        >
          <div className="property-lightbox-topbar">
            <div>
              <strong>{propertyName}</strong>
              <span>{activeIndex + 1} / {images.length}</span>
            </div>
            <button type="button" onClick={closeViewer} aria-label="Close photo viewer">
              <X size={25} />
            </button>
          </div>

          <div className="property-lightbox-stage">
            <button
              type="button"
              className="property-lightbox-arrow property-lightbox-prev"
              onClick={showPrevious}
              aria-label="Previous photo"
            >
              <ChevronLeft size={30} />
            </button>

            <div className="property-lightbox-image-wrap">
              <img
                src={images[activeIndex]}
                alt={`${propertyName} full-size photo ${activeIndex + 1}`}
              />
            </div>

            <button
              type="button"
              className="property-lightbox-arrow property-lightbox-next"
              onClick={showNext}
              aria-label="Next photo"
            >
              <ChevronRight size={30} />
            </button>
          </div>

          <div className="property-lightbox-thumbs" aria-label="Photo thumbnails">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={index === activeIndex ? "active" : ""}
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
