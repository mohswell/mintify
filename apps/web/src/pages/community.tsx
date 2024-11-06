import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layouts";
import { fetchAllImages } from "@/actions";
import { CommunityImage } from "@/types";
import { CommunityCard } from "@/components/views/CommunityCard";
import { IconLoader } from "@tabler/icons-react";

export default function Community() {
  const [images, setImages] = useState<CommunityImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [isPending, setPending] = useState<boolean>(true);

  // Fetch images when the component mounts
  useEffect(() => {
    async function loadImages() {
      try {
        const response = await fetchAllImages(); 
        if (response.ok) {
          setImages(response.data);
        } else {
          console.error("Error fetching images:", response);
        }
      } catch (error) {
        setPending(false);
        console.error("Error fetching images:", error);
      } finally {
        setPending(false);
        setLoading(false);
      }
    }
    loadImages();
  }, []);

  return (
    <DashboardLayout
      page={{
        title: "Community",
        description:
          "Submit more photos to unlock your creative potential with our photography community.",
      }}
    >
      {isPending && loading ? (
        <div className="flex items-center justify-center min-h-screen w-full">
          <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col min-h-screen w-full">
        <div className="flex-1 w-full grid grid-cols-1 max-w-[1356px] mx-auto px-4">
        <CommunityCard images={images} />
          {/* <CommunityGallery images={images} /> */}
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}