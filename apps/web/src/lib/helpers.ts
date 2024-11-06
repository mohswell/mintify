export function validateEmail(email: string): boolean {
  // Regular expression for email validation
  const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
}

export function convertImageSize(kb: number): string {
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  } else if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  } else {
    return `${kb.toFixed(2)} KB`;
  }
}

export function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }

  return v;
}

/**
 * Converts the file size to the specified unit and returns the size as a number.
 *
 * @param {File} file - The file whose size is to be checked.
 * @param {'bytes' | 'kb' | 'mb' | 'gb'} unit - The unit for the file size.
 * @return {number} The size of the file in the specified unit.
 */
export function getFileSize(
  file: File,
  unit: "bytes" | "kb" | "mb" | "gb" = "kb",
): number {
  const sizeInBytes = file.size;

  switch (unit) {
    case "kb":
      return sizeInBytes / 1024;
    case "mb":
      return sizeInBytes / (1024 * 1024);
    case "gb":
      return sizeInBytes / (1024 * 1024 * 1024);
    default:
      return sizeInBytes;
  }
}
