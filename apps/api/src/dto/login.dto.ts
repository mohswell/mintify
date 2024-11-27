import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => Number(value))
  githubId: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  avatarUrl?: string;
}