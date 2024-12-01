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
    "Good morning! Time to caffeinate and dominate. ☕",
    "Morning, dev! Ready to merge some 'features'? 🐛",
    "Good morning! The bugs aren't fixing themselves! 🌅",
    "Rise and debug! Your bugs missed you. 🐦",
    "Hey! Don't forget: coffee first, deploy later. ☀️",
  ],
  [GreetingTime.Afternoon]: [
    "Good afternoon! How's the chaos going? 🔍",
    "Afternoon! Did you commit your crimes yet? 💾",
    "Good afternoon! Have you fixed anything today? 🛠️",
    "Hey, don't forget to take a snack break. Even bugs need a pause. 🍴",
    "Afternoon! Let’s hope no one pushes to production today. 🚀",
  ],
  [GreetingTime.Evening]: [
    "Good evening! Wrapping up, or pulling an all-nighter? 🌙",
    "Evening! The only thing darker than your code is your sleep schedule. 🌌",
    "Good evening! Commit your code before you commit to bed. 💻",
    "Hey! Sleep is temporary, bugs are eternal. 🐛",
    "Evening! Remember to save your work before sleep. 🛏️",
  ],
};

const DAY_SPECIFIC_JOKES: Record<string, string[]> = {
  Monday: [
    "Happy Monday! Let's start the week with a prod issue. 🐛",
    "It's Monday! Did you remember to silence notifications? 📵",
    "Monday: The day where bugs magically appear from nowhere. ✨",
  ],
  Friday: [
    "It's Friday! Don't let the Intern merge their Pull requests.🙃",
    "Happy Friday! Remember: push to prod, enjoy the chaos. 🚀",
    "Friday: Let's deploy and pray. 🙏",
    "Friday vibes: Let’s deploy and go home, nothing will break.",
    "It's Friday! Don't break production, or enjoy the weekend stress-free... your choice.",
    "Friday: Where heroes push directly to main and pray to the deployment gods. 🚀",
    "TGIF! But if you push to prod now, we’re all doomed. 🔥",
  ],
};

const DARK_MODE_JOKES = [
  "Dark mode, huh? Perfect match for your sense of humor.",
  "Your screen's darker than your commit messages.",
  "Welcome to the dark side. We have no bugs here.",
  "Dark mode on. Now debugging in stealth mode. 🕵️‍♂️",
  "Dark mode? Bold choice for someone who still uses 'console.log.'",
];


export function useGreeting(isDarkMode: boolean) {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = dayjs().hour();
      const currentDay = dayjs().format("dddd");

      let greetingType: GreetingTime;

      if (currentHour >= 5 && currentHour < 12) {
        greetingType = GreetingTime.Morning;
      } else if (currentHour >= 12 && currentHour < 18) {
        greetingType = GreetingTime.Afternoon;
      } else {
        greetingType = GreetingTime.Evening;
      }

      const baseGreetings = GREETINGS[greetingType];
      const daySpecific = DAY_SPECIFIC_JOKES[currentDay] || [];
      const darkModeJoke = isDarkMode
        ? DARK_MODE_JOKES[Math.floor(Math.random() * DARK_MODE_JOKES.length)]
        : "";

      const allGreetings = [...baseGreetings, ...daySpecific];
      const randomGreeting =
        allGreetings[Math.floor(Math.random() * allGreetings.length)] || "Hello!";

      // Randomly choose between dark mode joke or time-based greeting
      const finalGreeting = darkModeJoke && Math.random() < 0.5
        ? darkModeJoke
        : randomGreeting;

      setGreeting(finalGreeting);
    };

    // Update greeting immediately and every interval
    updateGreeting();
    const interval = setInterval(updateGreeting, GREETING_INTERVAL);

    return () => clearInterval(interval);
  }, [isDarkMode]);

  return greeting;
}
