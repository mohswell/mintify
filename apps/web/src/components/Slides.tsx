import Image from "next/image";
import { useState, useEffect } from "react";
import Flag from "react-world-flags";

interface Slide {
  name: string;
  image: string;
  countryCode: string;
}

// Transition duration and intervals in ms
const TEXT_SLIDE_IN_DURATION = 2000;
const TEXT_SLIDE_OUT_DURATION = 500;
const FADE_TRANSITION_DURATION = 200;
const SLIDE_INTERVAL = 7000;

const slides: Slide[] = [
  { name: "Kun Elven", image: "/assets/slides/kun-elven.png", countryCode: "UG" },
  { name: "Kenneth Gueke", image: "/assets/slides/kenneth-gueke.png", countryCode: "TG" },
  { name: "Kanmi Osho", image: "/assets/slides/kanmi-osho.png", countryCode: "ZA" },
  { name: "Isaac Gyamfi", image: "/assets/slides/isaac-gyamfi.png", countryCode: "GH" },
  { name: "Trigger Shots", image: "/assets/slides/trigger-shots.png", countryCode: "NG" },
  { name: "DC Photography", image: "/assets/slides/dc-photography.png", countryCode: "NG" },
];

export default function Slides() {
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  // const [slideOut, setSlideOut] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<Slide | undefined>(slides[0]);


  useEffect(() => {
    const interval = setInterval(() => {
      // Start text slide out before image transition
      // setSlideOut(true);

      setTimeout(() => {
        // Start image fade out
        setFadeOut(true);

        setTimeout(() => {
          // Change slide
          setActiveSlide((prevSlide) => {
            const currentIndex = slides.findIndex(
              (slide) => slide.name === (prevSlide?.name ?? "")
            );
            const nextIndex = (currentIndex + 1) % slides.length;
            return slides[nextIndex];
          });

          setFadeOut(false);
          // setSlideOut(false);

          setTimeout(() => {
            // setSlideOut(false);
          }, TEXT_SLIDE_IN_DURATION); // Duration for sliding in text after new image is shown
        }, FADE_TRANSITION_DURATION); // Duration of fade transition
      }, TEXT_SLIDE_OUT_DURATION); // Time between text slide out and image fade
    }, SLIDE_INTERVAL); // Total time for each slide

    return () => clearInterval(interval);
  }, []);

  // Preload images
  useEffect(() => {
    slides.forEach((slide) => {
      const preloadImage = new window.Image();
      preloadImage.src = slide.image;
    });
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map((slide) => (
        <div
          key={slide.name}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out
          ${
            slide.name === (activeSlide?.name ?? "")
              ? fadeOut
                ? "opacity-0"
                : "opacity-100"
              : "opacity-0"
          }`}
        >
          <Image
            width={804}
            height={410}
            src={slide.image}
            alt={slide.name}
            quality={100}
            priority
            className="w-full h-full object-center object-cover"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-black/0 p-6 overflow-hidden flex items-center">
            <h2 className="text-sm !leading-[14px] tracking-[-2%] font-light text-white">
              Work by <span className="font-normal">{slide.name}</span>
            </h2>
            <div className="ml-2">
              <Flag
                code={slide.countryCode}
                style={{ width: '20px', height: '20px' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
