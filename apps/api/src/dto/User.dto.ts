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
    @MinLength(4)
    username: string;
  
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPremium: boolean;

    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isAdmin: boolean;

    @IsBoolean()
    @IsOptional()
    isInactive?: boolean;

    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    
    @IsString()
    @IsOptional() 
    aiUserToken?: string;

    @IsEnum(UserRole)
    role: UserRole;

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