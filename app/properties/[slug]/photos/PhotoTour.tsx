"use client";

import { useEffect, useRef, useState } from "react";
import type { PhotoTourSection } from "../../photoTourData";

type PhotoTourProps = {
  propertyName: string;
  sections: PhotoTourSection[];
};

export default function PhotoTour({ propertyName, sections }: PhotoTourProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function scrollToSection(id: string) {
    setActiveId(id);
    document.getElementById(`photo-section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(`photo-section-${section.id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id.replace("photo-section-", "");
        setActiveId(id);
        categoryRefs.current[id]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      },
      { rootMargin: "-18% 0px -56% 0px", threshold: [0, 0.08, 0.2, 0.4] },
    );

    sectionElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <section className="photo-tour-category-section" aria-label="Photo categories">
        <p className="photo-tour-kicker">Chestnut By the Sea</p>
        <h1>Photo tour</h1>
        <p className="photo-tour-intro">
          Jump to a room or keep scrolling to explore the entire property.
        </p>
        <div className="photo-tour-category-grid">
          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              ref={(element) => { categoryRefs.current[section.id] = element; }}
              className={`photo-tour-category${activeId === section.id ? " active" : ""}`}
              onClick={() => scrollToSection(section.id)}
              aria-current={activeId === section.id ? "true" : undefined}
            >
              <span className="photo-tour-category-image">
                <img src={section.thumbnail} alt="" />
              </span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="photo-tour-sections">
        {sections.map((section, sectionIndex) => (
          <section
            className="photo-tour-section"
            id={`photo-section-${section.id}`}
            key={section.id}
          >
            <div className="photo-tour-section-title">
              <h2>{section.label}</h2>
              <span>{section.images.length} photo{section.images.length === 1 ? "" : "s"}</span>
            </div>
            <div className={`photo-tour-photo-grid${section.images.length === 1 ? " single-photo" : ""}`}>
              {section.images.map((src, index) => (
                <button
                  type="button"
                  className={index === 0 ? "photo-tour-photo featured" : "photo-tour-photo"}
                  key={`${section.id}-${src}-${index}`}
                  aria-label={`Open ${section.label} photo ${index + 1} of ${section.images.length}`}
                >
                  <img
                    src={src}
                    alt={`${propertyName} ${section.label.toLowerCase()} photo ${index + 1}`}
                    loading={sectionIndex === 0 && index === 0 ? "eager" : "lazy"}
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
