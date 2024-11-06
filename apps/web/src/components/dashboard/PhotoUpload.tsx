import { Device } from "@/lib/constants";
import { Button } from "@/components/shared";
import { useViewportSize } from "@mantine/hooks";
import { useDisclosure, useElementSize } from "@/hooks";
import { IconChevronDown, IconImage, IconMinus } from "@/components/icons";
import { SubmissionModal } from "../SubmissionModal";

export function PhotoUpload() {
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
          Submit photos
        </h3>

        <div className="relative sm:hidden h-6 w-6 shrink-0 flex justify-center items-center">
          <IconChevronDown
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${opened ? "rotate-180 opacity-0" : "rotate-0 opacity-100"}`}
          />
          <IconMinus
            className={`h-auto w-6 shrink-0 absolute right-0 transition-all text-light-gray-6 dark:text-light-gray-7 duration-300 stroke-[1.5]
            ${opened ? "rotate-180 opacity-100" : "rotate-0 opacity-0"}`}
          />
        </div>
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
          <EmptyPhotoUpload />
        </div>
      </div>
    </div>
  );
}

const EmptyPhotoUpload = () => {
  const [opened, { open, close }] = useDisclosure();

  return (
    <>
      <div className="w-full flex justify-center items-center sm:py-16 pt-6 h-[50%] shrink-0">
        <div className="flex sm:flex-col flex-col-reverse m-auto sm:items-center sm:justify-center sm:gap-y-6 gap-y-24">
          <Button onClick={open} className="!py-5 !px-8">
            <IconImage className="h-auto w-6 shrink-0" />
            Upload photos
          </Button>

          <p className="sm:text-center text-left font-light sm:text-base text-light-gray-7 dark:text-light-gray-6 text-sm tracking-[-2%] !leading-[18px] w-full max-w-[544px]">
            Submit your works for review for our{" "}
            <span className="font-medium">STUCRUUM</span> project. Remember to
            tick ☑ the ‘ARTRUUM’ checkbox if you’re also submitting for our{" "}
            <span className="font-medium">ARTRUUM</span> project.
          </p>
        </div>
      </div>

      <SubmissionModal opened={opened} onClose={close} />
    </>
  );
};
