import Image from "next/image";
import {
  ChangeEvent,
  useState,
  useCallback,
  useRef,
} from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "react-spring";
import TagInput from "@/components/TagInput";
import { IconX } from "@tabler/icons-react";
import {
  ImageUploadResponse,
  ModalProps,
  NewSubmission,
  SubmissionFile,
  Photo,
  PhotoIndicatorProps,
  PhotoViewProps,

} from "@/types";
import { Button, Checkbox, Modal, Textarea } from "@/components/shared";
import { MAX_IMAGE_SIZE } from "@/lib/constants";
import { IconPlus, IconTrash } from "@/components/icons";
import notification from "@/lib/notification";
import { getFileSize } from "@/lib/helpers";
import { createSubmission, uploadImage } from "@/actions";

export function SubmissionModal({ opened, onClose }: ModalProps) {
  const [images, setImages] = useState<Photo[]>([]);
  const [activeImage, setActiveImage] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submission, setSubmission] = useState<NewSubmission>({
    artruum_submission: false,
    description: "",
    tags: [],
    files: [],
  });

  const canCreate = submission.tags.length && images.length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx], cancel }) => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;

        if (maxScroll <= 0) {
          cancel();
        } else {
          api.start({ x: down ? mx : 0, immediate: down });
          if (!down) {
            const currentScroll = scrollRef.current.scrollLeft;
            scrollRef.current.scrollTo({
              left: currentScroll - mx,
              behavior: "smooth",
            });
          }
        }
      }
    },
    { filterTaps: true },
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (!files) return;

      const newImages: Photo[] = [];

      Array.from(files).forEach((file) => {
        const fileSizeInMB = getFileSize(file, "mb");

        if (fileSizeInMB > MAX_IMAGE_SIZE) {
          notification({
            type: "error",
            title: "Image size limit exceeded",
            message: `The image ${file.name} exceeds the ${MAX_IMAGE_SIZE}MB limit`,
          });
        } else {
          newImages.push({
            id: crypto.randomUUID(),
            image: file,
            url: URL.createObjectURL(file),
          });
        }
      });

      setImages((prev) => [...prev, ...newImages]);
    },
    [],
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const newImages = prev.filter((img) => img.id !== id);
        if (newImages.length === 0) {
          setActiveImage(0);
        } else if (activeImage >= newImages.length) {
          setActiveImage(newImages.length - 1);
        }
        return newImages;
      });
    },
    [activeImage],
  );

  const handleImageUpload = async (): Promise<SubmissionFile[] | null> => {
    const imageData = new FormData();

    try {
      for (const img of images) {
        imageData.append("files", img.image);
      }

      const res = await uploadImage(imageData);

      if (!res.ok) {
        notification({
          type: "error",
          title: "Upload failed",
          message: "An unexpected error occurred while uploading image(s)",
        });

        return null;
      }

      const data = res.data as ImageUploadResponse;
      return data.files;
    } catch (error) {
      console.error("Error uploading images:", error);

      notification({
        type: "error",
        title: "Upload failed",
        message: "An unexpected error occurred while uploading image(s)",
      });

      return null;
    }
  };

  const handleCreateSubmission = async () => {
    setSubmitting(true);

    try {
      const uploadedFiles = await handleImageUpload();

      if (!uploadedFiles) {
        setSubmitting(false);
        return;
      }

      const submissionData: NewSubmission = {
        ...submission,
        files: uploadedFiles,
      };

      const res = await createSubmission(submissionData);

      console.log("res.data:::", res.data);

      if (!res.ok) {
        throw new Error(res.data.message || "Failed to create submission");
      }

      notification({
        type: "success",
        title: "Submission successful",
        message: "Your photos have been submitted successfully",
      });

      // Close the modal and reset the state
      onClose();
      setImages([]);
      setActiveImage(0);
      setSubmission({
        artruum_submission: false,
        description: "",
        tags: [],
        files: [],
      });
      window.location.reload();
    } catch (error) {
      console.error("Error creating submission:", error);
      notification({
        type: "error",
        title: "Submission failed",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while submitting your photos",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose}>
      <div className="md:w-[calc(100vw-32px)] w-full relative shrink-0 md:max-w-[1180px] md:rounded-2xl md:p-6 px-3.5 py-12 min-h-[743px] bg-white dark:bg-dark-darker text-dark-darker dark:text-white grid md:grid-cols-12 grid-cols-1 gap-6">
        <button
          onClick={onClose}
          className="absolute md:top-4 md:right-5 top-3.5 right-3.5 p-1"
        >
          <IconX className="h-auto w-5 shrink-0" />
        </button>

        <div className="grid grid-cols-1 gap-y-6 w-full md:col-span-7">
          <PhotoView
            images={images}
            activeImage={activeImage}
            onRemove={removeImage}
            onChange={handleInputChange}
          />

          {images.length > 0 && (
            <>
              <div
                ref={scrollRef}
                className="w-full gap-x-2 md:order-2 order-3 flex justify-start relative items-center overflow-x-auto no-scrollbar"
                {...bind()}
              >
                <animated.div style={{ x }} className="flex gap-x-2">
                  {images.map((img, index) => (
                    <PhotoIndicator
                      key={img.id}
                      image={img}
                      isActive={activeImage === index}
                      onSelect={() => setActiveImage(index)}
                    />
                  ))}

                  <label className="h-[72px] w-[72px] shrink-0 text-black dark:text-white bg-light-gray-2 dark:bg-dark-2 hover:cursor-pointer rounded-lg flex justify-center items-center sticky left-0">
                    <IconPlus className="w-6 h-6" />

                    <input
                      type="file"
                      id="imageUpload"
                      name="imageUpload"
                      className="sr-only hidden"
                      accept="image/*"
                      onChange={handleInputChange}
                      multiple
                    />
                  </label>
                </animated.div>
              </div>

              <div className="w-full md:order-3 order-1">
                <p className="text-black dark:text-white md:text-base text-xl w-fit font-normal">
                  {activeImage + 1} of {images.length} photo
                  {images.length > 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="w-full md:col-span-5 grid grid-cols-1 gap-y-6 h-fit">
          <Textarea
            rows={6}
            id="description"
            label="Photo description"
            placeholder="Brief image description..."
            value={submission.description}
            onChange={(e) =>
              setSubmission((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          <TagInput
            label="Add tags to this photo"
            placeholder="Separate each tag with a comma e.g. landscape, city etc"
            value={submission.tags}
            onChange={(tags) => setSubmission((prev) => ({ ...prev, tags }))}
          />

          <div className="w-full">
            <Checkbox
              checked={submission.artruum_submission}
              onCheck={(value) =>
                setSubmission((prev) => ({
                  ...prev,
                  artruum_submission: !value,
                }))
              }
            >
              Also submit for ARTRUUM
            </Checkbox>
          </div>

          <Button
            loading={submitting}
            disabled={!canCreate}
            onClick={handleCreateSubmission}
          >
            Submit your photos
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PhotoIndicator({ image, isActive, onSelect }: PhotoIndicatorProps) {
  return (
    <div
      role="button"
      onClick={onSelect}
      className="h-[72px] w-[72px] aspect-square group shrink-0 flex justify-center items-center rounded-lg overflow-hidden relative"
    >
      <div
        className={`absolute w-full h-full flex border-[3px] z-[2] transition-all duration-100 rounded-lg
      ${
        isActive
          ? "border-black dark:border-white bg-white/60"
          : "border-transparent dark:border-transparent hover:bg-white/60"
      }`}
      ></div>

      <Image
        width={72}
        quality={50}
        height={72}
        loading="lazy"
        src={image.url}
        alt="submission image"
        className="w-full h-full object-cover object-center z-[1]"
      />
    </div>
  );
}

function PhotoView({
  images,
  activeImage,
  onRemove,
  onChange,
}: PhotoViewProps) {
  return (
    <div
      className={`aspect-square w-full flex justify-center items-center group relative md:order-1 order-2 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden ${images.length ? "max-h-[551px]" : "h-full"}`}
    >
      {images.length ? (
        <>
          <div className="w-full h-full flex justify-center items-center bg-black/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-[2] transition-all duration-300 ease-in-out">
            <button
              onClick={() => onRemove(images[activeImage].id)}
              className="p-1 text-white hover:text-red-600 transition-colors duration-200"
            >
              <IconTrash className="h-auto w-8" />
            </button>
          </div>

          <Image
            width={551}
            height={551}
            alt="submission image"
            src={images[activeImage].url}
            className="w-full h-full object-cover object-center z-[1]"
          />
        </>
      ) : (
        <>
          <label
            htmlFor="imageUpload"
            className="relative flex justify-center items-center w-full h-full hover:cursor-pointer"
          >
            <IconPlus className="w-8 h-8 text-black dark:text-white stroke-[1.2]" />
            <input
              type="file"
              id="imageUpload"
              name="imageUpload"
              className="sr-only hidden"
              accept="image/*"
              onChange={onChange}
              multiple
            />
          </label>
        </>
      )}
    </div>
  );
}
