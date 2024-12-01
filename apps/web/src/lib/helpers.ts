export function validateEmail(email: string): boolean {
  // Regular expression for email validation
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}


export function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const promptSuggestions = [
  "Explain this code",
  "Refactor for better performance",
  "Add comments and documentation",
  "Convert to TypeScript",
  "Use type interfaces for safety if applicable",
  "Generate unit tests",
  "Optimize for maintainability",
  "Provide examples of usage",
  "Suggest improvements for scalability",
  "Identify potential bugs or issues",
  "Provide alternative solutions or approaches"
];
