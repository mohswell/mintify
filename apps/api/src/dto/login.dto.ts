import { IsEmail, IsOptional, IsNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  username?: string;
}

export class GitHubLoginDto {
  @IsNumber()
  githubId: number;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  avatarUrl?: string;
}