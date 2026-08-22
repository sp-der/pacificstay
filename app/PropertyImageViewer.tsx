"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { chestnutPhotoTour } from "./properties/photoTourData";

type ViewerImage = {
  src: string;
  alt: string;
};

const chestnutViewerImages: ViewerImage[] = chestnutPhotoTour.flatMap((section) =>
  section.images.map((src, index) => ({
    src,
    alt: `${section.label} photo ${index + 1}`,
  })),
);

function imageKey(src: string) {
  try {
    return new URL(src, window.location.origin).pathname;
  } catch {
    return src.split("?")[0];
  }
}

export default function PropertyImageViewer() {
  const [images, setImages] = useState<ViewerImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isOpen = activeIndex !== null;

  function closeViewer() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return current;
      return current === 0 ? images.length - 1 : current - 1;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null || images.length === 0) return current;
      return current === images.length - 1 ? 0 : current + 1;
    });
  }

  useEffect(() => {
    function handleGalleryClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const clickedImage = target?.closest(
        ".property-gallery img, .photo-tour-photo img",
      ) as HTMLImageElement | null;

      if (!clickedImage) return;

      const isChestnutProperty = window.location.pathname.includes(
        "/properties/chestnut-by-the-sea",
      );

      if (isChestnutProperty) {
        const clickedKey = imageKey(clickedImage.currentSrc || clickedImage.src);
        const clickedIndex = chestnutViewerImages.findIndex(
          (image) => imageKey(image.src) === clickedKey,
        );

        setImages(chestnutViewerImages);
        setActiveIndex(clickedIndex >= 0 ? clickedIndex : 0);
        return;
      }

      const photoTour = clickedImage.closest(".photo-tour-page");
      const propertyGallery = clickedImage.closest(".property-gallery");

      const imageNodes = photoTour
        ? Array.from(photoTour.querySelectorAll<HTMLImageElement>(".photo-tour-photo img"))
        : propertyGallery
          ? Array.from(propertyGallery.querySelectorAll<HTMLImageElement>("img"))
          : [];

      if (!imageNodes.length) return;

      const nextImages = imageNodes.map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.alt || "Property photo",
      }));
      const clickedIndex = imageNodes.indexOf(clickedImage);

      if (clickedIndex < 0) return;

      setImages(nextImages);
      setActiveIndex(clickedIndex);
    }

    document.addEventListener("click", handleGalleryClick);
    return () => document.removeEventListener("click", handleGalleryClick);
  }, []);

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

  if (activeIndex === null || images.length === 0) return null;

  return (
    <div className="property-lightbox" role="dialog" aria-modal="true" aria-label="Property photo viewer">
      <div className="property-lightbox-topbar">
        <div>
          <strong>Chestnut By the Sea</strong>
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
          <ChevronLeft size={31} />
        </button>

        <div className="property-lightbox-image-wrap">
          <img src={images[activeIndex].src} alt={images[activeIndex].alt} />
        </div>

        <button
          type="button"
          className="property-lightbox-arrow property-lightbox-next"
          onClick={showNext}
          aria-label="Next photo"
        >
          <ChevronRight size={31} />
        </button>
      </div>

      <div className="property-lightbox-thumbs" aria-label="Property photo thumbnails">
        {images.map((image, index) => (
          <button
            type="button"
            key={`${image.src}-${index}`}
            className={index === activeIndex ? "active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`View photo ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          >
            <img src={image.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
