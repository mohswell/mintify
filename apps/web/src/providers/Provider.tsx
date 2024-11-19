import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      defaultColorScheme="light"
      classNamesPrefix="stucruum"
      theme={{ primaryColor: "gray" }}
    >
      <Notifications
        limit={1}
        zIndex={9999}
        color="#1A1A1A"
        autoClose={3500}
        containerWidth={320}
        position="top-right"
      />
      {children}
    </MantineProvider>
  );
}
