import dayjs from "dayjs";
import { useEffect, useState } from "react";

const GREETING_INTERVAL = 60000; // in ms

enum GreetingTime {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
}

const GREETINGS: Record<GreetingTime, string[]> = {
  [GreetingTime.Morning]: [
    "Good morning! Let's write some clean code today! ☕",
    "Morning, early bird! Debugging already? 🐦",
    "Top of the morning! Ready to conquer the bugs? 🌅",
    "Good morning! Hope you had a good night's sleep, or at least coffee. ☀️",
    "Rise and shine! The code awaits. 🌞",
  ],
  [GreetingTime.Afternoon]: [
    "Good afternoon! How's the debugging going? 🔍",
    "Afternoon! Have you committed greatness yet? 💾",
    "Good afternoon! Don't forget to take a break from the console. 😌",
    "Hey! Hope your lunch was as good as your code. 🍴",
    "Afternoon! Let's push some features (and maybe not break prod)! 🚀",
  ],
  [GreetingTime.Evening]: [
    "Good evening! Wrapping up or just getting started? 🌙",
    "Evening dev! Pull requests or pull blankets? 🛌",
    "Good evening! Remember to save and close the editor. 💾",
    "Hey night owl! The code gods are watching. 🌌",
    "Good evening! Let’s debug the mysteries of the universe (or your app). ✨",
  ],
};

export function useGreeting() {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = dayjs().hour();
      let greetingType: GreetingTime;

      if (currentHour >= 5 && currentHour < 12) {
        greetingType = GreetingTime.Morning;
      } else if (currentHour >= 12 && currentHour < 18) {
        greetingType = GreetingTime.Afternoon;
      } else {
        greetingType = GreetingTime.Evening;
      }

      const greetings = GREETINGS[greetingType];
      const randomGreeting =
        greetings[Math.floor(Math.random() * greetings.length)] || "Hello!";

      setGreeting(randomGreeting);
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
