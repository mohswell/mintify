import dayjs from "dayjs";
import { useEffect, useState } from "react";

const GREETING_INTERVAL = 60000; // in ms

export function useGreeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = dayjs().hour();

      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good morning!");
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting("Good afternoon!");
      } else {
        setGreeting("Good evening!");
      }
    };

    // Update greeting immediately when the component mounts
    updateGreeting();

    // Set interval to update greeting every minute (60000ms)
    const interval = setInterval(updateGreeting, GREETING_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
