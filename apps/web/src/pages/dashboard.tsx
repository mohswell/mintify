import { DashboardLayout } from "@/components/layouts";
import { PhotoUpload, Profile, Submissions } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <DashboardLayout
      page={{
        title: "Dashboard",
        description:
          "Submit more photos to unlock your creative potential with our photography community.",
      }}
    >
      <div className="w-full grid md:grid-cols-2 pb-16 sm:pb-0 grid-cols-1 md:gap-6 sm:gap-4 max-w-[1356px] sm:h-auto h-fit sm:m-auto sm:min-h-[704px]">
        <div className="gri grid-cols-1 flex flex-col w-full md:gap-6 sm:gap-4 h-full">
          <Profile />
          <PhotoUpload />
        </div>

        <Submissions />
      </div>
    </DashboardLayout>
  );
}
