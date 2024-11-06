interface StatProps {
  name: string;
  value: number;
}

export function StatCard({ name, value }: StatProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl h-24 w-24 shrink-0 border border-light-gray-4 dark:border-dark first-of-type:border-black dark:first-of-type:border-white bg-light-gray-1 dark:bg-dark-background first-of-type:bg-black dark:first-of-type:bg-white text-dark-darker dark:text-white first-of-type:text-white dark:first-of-type:text-dark-darker">
      <div className="flex flex-col items-center justify-center gap-y-2">
        <h1 className="sm:text-[40px] text-[32px] font-medium leading-8 tracking-[-2%]">
          {value}
        </h1>
        <p className="text-sm font-light !leading-4 tracking-[-2%]">{name}</p>
      </div>
    </div>
  );
}
