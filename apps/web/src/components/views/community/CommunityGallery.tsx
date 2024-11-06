import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import { CommunityGalleryProps } from "@/types";

export default function CommunityGallery({ images }: CommunityGalleryProps) {
  // const [selected, setSelected] = useState<number | string>();
  // const [showModal, setShowModal] = useState<boolean>(false);

  const responsive = {
    superLargeDesktop: {
      items: 6,
      partialVisibilityGutter: 40,
      breakpoint: { max: 4000, min: 1680 },
    },
    desktop: {
      items: 5,
      partialVisibilityGutter: 40,
      breakpoint: { max: 1680, min: 768 },
    },
    tablet: {
      items: 2,
      partialVisibilityGutter: 30,
      breakpoint: { max: 768, min: 501 },
    },
    mobile: {
      items: 1,
      partialVisibilityGutter: 0,  // Changed this to 0
      breakpoint: { max: 500, min: 0 },
    },
  };

  return (
    <div className="w-full">
      {/* <h1 className="text-2xl font-semibold text-center md:text-left px-4 mb-6">
        All Community Photos
      </h1> */}
      
      <div className="w-full min-h-[420px]"> {/* Changed height to min-height */}
        <Carousel
          autoPlay
          infinite
          autoPlaySpeed={1500}
          responsive={responsive}
          removeArrowOnDeviceType={["mobile"]}
          showDots={false}
          className="w-full"
          containerClass="w-full"
        >
          {images.map((photo, index) => (
            <div
              key={index}
              className="w-full px-2 mb-4" // Simplified classes
            >
              <div className="relative w-full h-[420px] rounded-md group">
                <span className="font-normal text-sm !leading-4 bg-white dark:bg-dark text-dark dark:text-white transition-all duration-300 ease-in-out opacity-0 group-hover:md:opacity-100 invisible group-hover:md:visible tracking-[-3%] absolute top-4 right-5 rounded-full px-2 py-1 z-[2]">
                  <span className="font-light">by</span> {photo.users.first_name} {photo.users.last_name}
                </span>

                <Image
                  src={photo.image_url}
                  onClick={() => {
                    //setSelected(photo.title);
                    //setShowModal(true);
                  }}
                  fill
                  alt={`Photo by ${photo.users.first_name} ${photo.users.last_name}`}
                  className="object-cover object-center rounded-md"
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Optional: Modal to display full-size images */}
      {/* <GalleryModal opened={showModal} selected={selected} onClose={setShowModal} /> */}
    </div>
  );
}