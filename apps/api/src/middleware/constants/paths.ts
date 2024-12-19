export const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/',
  '/api/v1/auth/(.*)',
  '/api/v1/health',
  '/api-docs',
  '/swagger',
] as const;

export const STATIC_FILE_EXTENSIONS = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.txt'] as const;
