import Image from "next/image";
import { Submission } from "@/types";
import { STATUS_SYMBOLS } from "@/lib/constants";

interface ICardProps {
  submission: Submission;
  onClick?: () => void;
}

export function SubmissionCard({ submission, onClick }: ICardProps) {
  return (
    <>
      <div className="grid grid-cols-1 w-full">
        <div
          className="w-full flex justify-start items-center gap-x-4 cursor-pointer" // Add cursor pointer for indication
          onClick={onClick} // Attach onClick here
        >
          <div className="overflow-hidden h-16 w-16 shrink-0 rounded-lg bg-black/10 dark:bg-white/10">
            <Image
              width={160}
              height={160}
              quality={100}
              loading="lazy"
              placeholder="blur"
              alt={submission.title}
              src={submission.image_url}
              blurDataURL={submission.image_url}
              className="rounded-lg w-full h-full object-cover object-center"
            />
          </div>

          <div className="flex justify-between items-center py-4 flex-grow">
            <div className="flex flex-col justify-center text-base font-light !leading-4 items-start gap-y-1">
              <h3 className="text-back dark:text-white">{submission.title}</h3>
              <p className="text-light-gray-6 dark:text-light-gray-7">
                {submission.size}
              </p>
            </div>

            <div className="flex justify-center items-center">
              {submission.artruum_submission && (
                <span className="text-xl font-normal !leading-4">🖼</span>
              )}
              <span className="text-xl font-normal !leading-4">
                {STATUS_SYMBOLS[submission.status]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-start items-center gap-x-4 py-3 h-fit last-of-type:hidden">
        <div className="h-0 w-16 shrink-0" />
        <div className="flex-grow h-0 shrink-0 border-b-[0.5px] border-light-gray-5 dark:border-dark-2" />
      </div>
    </>
  );
}
