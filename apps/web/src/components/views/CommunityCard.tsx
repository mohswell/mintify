import { Device } from "@/lib/constants";
import { useViewportSize } from "@mantine/hooks";
import { useDisclosure, useElementSize } from "@/hooks";
import CommunityGallery from "./community/CommunityGallery";
import { CommunityGalleryProps } from "@/types";

export function CommunityCard({ images }: CommunityGalleryProps) {
    const { width } = useViewportSize();
    const { ref, height } = useElementSize();
    const [opened, { toggle }] = useDisclosure(true);
  
    const isMobile = width <= Device.TABLET_SM;
  
    return (
      <div
        className={`flex flex-col flex-1 sm:p-6 p-4 bg-white min-h-max h-full dark:bg-dark-darker transition-all duration-300
        ${opened ? "rounded-2xl sm:mt-0 mt-8" : "rounded-lg mt-4"}`}
      >
        <div
          role={isMobile ? "button" : "none"}
          onClick={isMobile ? toggle : undefined}
          className="flex justify-between items-center w-full relative h-8"
        >
          <h3 className="font-medium text-lg !leading-[18px] tracking-[-2%]">
            Community Gallery
          </h3>
        </div>
  
        <div
          style={{ height: opened ? height : 0 }}
          className="w-full overflow-hidden transition-all duration-500 flex-grow flex flex-col items-center justify-center ease-in-out"
        >
          <div
            ref={ref}
            className={`w-full transition-all duration-200
            ${opened ? "opacity-100 visible" : "opacity-0 invisible"}`}
          >
            {/* Gallery Component */}
            <CommunityGallery images={images} />
          </div>
        </div>
      </div>
    );
  }
