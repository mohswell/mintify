import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsBoolean, IsNotEmpty, IsOptional, IsPhoneNumber, IsEnum, Min, Max, IsDateString, IsInt, MinLength } from 'class-validator';
import { UserRole } from '~/types';

export class UserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @IsString()
    @IsNotEmpty()
    lastName: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Username must be at least 4 characters long' })
    username: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    isPremium?: boolean = false;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    isAdmin?: boolean = false;

    @IsBoolean()
    @IsOptional()
    isInactive?: boolean;

    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    
    @IsString()
    @IsOptional() 
    aiUserToken?: string;

    @IsEnum(UserRole, { message: 'Role must be one of: admin, user, moderator, guest' })
    @IsOptional()
    role?: UserRole = UserRole.User;

    @IsInt()
    @Min(1) 
    @Max(100)
    @IsOptional()
    maxRequestsPerDay: number;

    @IsString()
    @IsOptional()  
    githubRepositoryUrl: string;

    @IsDateString()
    @IsOptional()
    registrationDate?: string;

    @IsBoolean()
    @IsOptional() 
    isActive?: boolean;

    @IsString()
    @IsOptional()
    aiModelVersion?: string;
}