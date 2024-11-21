import { Button } from "@/components/views/ui/button";
import { DataStats } from "@/components/features";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <DataStats />
          {/* <h3 className="text-2xl font-bold tracking-tight">
            You have no contents yet
          </h3>
          <p className="text-sm text-muted-foreground">
            You can start building the dashboard page mohswell.
          </p>
          <Button className="mt-4">Email me</Button> */}
        </div>
      </div>
    </main>
  );
}