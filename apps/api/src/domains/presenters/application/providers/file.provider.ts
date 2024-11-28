import { FileType } from '@prisma/client';

export class FileProvider {
  /**
   * Mapping of file extensions to FileType
   * @private
   */
  private static readonly FILE_TYPE_MAP: Record<string, FileType> = {
    // JavaScript and TypeScript
    'js': FileType.JAVASCRIPT,
    'jsx': FileType.JAVASCRIPT,
    'ts': FileType.TYPESCRIPT,
    'tsx': FileType.TYPESCRIPT,

    // Markdown
    'md': FileType.MARKDOWN,

    // YAML
    'yml': FileType.YAML,
    'yaml': FileType.YAML,

    // CSS
    'css': FileType.CSS,
    'scss': FileType.CSS,
    'less': FileType.CSS,

    // Bash
    'sh': FileType.BASH,
    'bash': FileType.BASH,

    // Python
    'py': FileType.PYTHON,

    // Java
    'java': FileType.JAVA,
  };

  /**
   * Determines the FileType based on file extension
   * @param filePath Path of the file
   * @returns Mapped FileType or FileType.OTHER if no match found
   */
  static determineFileType(filePath: string): FileType {
    // Extract file extension and convert to lowercase
    const fileExt = filePath.split('.').pop()?.toLowerCase();
    
    // Return mapped type or OTHER if no match
    return fileExt ? this.FILE_TYPE_MAP[fileExt] || FileType.OTHER : FileType.OTHER;
  }

  /**
   * Checks if a file type is considered a code file
   * @param fileType FileType to check
   * @returns Boolean indicating if it's a code file
   */
  static isCodeFile(fileType: FileType): boolean {
    const codeFileTypes = [
      FileType.JAVASCRIPT, 
      FileType.TYPESCRIPT, 
      FileType.PYTHON, 
      FileType.JAVA, 
      FileType.BASH
    ];
    return codeFileTypes.includes(fileType);
  }
}