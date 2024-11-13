import { IsString, IsEmail, IsBoolean, IsNotEmpty, IsOptional, IsPhoneNumber, IsEnum, Min, Max, IsDateString, IsInt } from 'class-validator';
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
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    isPremium: boolean;

    @IsBoolean()
    isAdmin: boolean;

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