import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <MantineProvider
      //colorScheme={theme as "light" | "dark"}
      defaultColorScheme={theme as "light" | "dark"}
      classNamesPrefix="stucruum"
      theme={{ 
        primaryColor: "dark",
        colors: {
          // Define custom colors to match your Tailwind config
          dark: [
            '#FAFAFA', // 0
            '#F0F0F0', // 1
            '#202020', // 2: dark-2
            '#EFEFEF', // 3
            '#E6E6E6', // 4
            '#DDDDDD', // 5
            '#A5A5A5', // 6
            '#808080', // 7
            '#1A1A1A', // 8: dark.DEFAULT
            '#0D0D0D', // 9: dark.darker
          ],
        },
        black: '#1A1A1A',
        white: '#FFFFFF',
      }}
      //withNormalizeCSS
      //withGlobalStyles
    >
      <Notifications
        limit={1}
        zIndex={9999}
        color={theme === 'dark' ? "#ffffff" : "#1A1A1A"}
        autoClose={3500}
        containerWidth={320}
        position="top-right"
      />
      {children}
    </MantineProvider>
  );
}
