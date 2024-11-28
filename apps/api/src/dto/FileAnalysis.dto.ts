import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { FileType, FileStatus, AiAnalysisStatus } from '@prisma/client';

export class FileAnalysisDto {
    @IsNumber()
    prNumber: number;

    @IsString()
    filePath: string;

    @IsEnum(FileType)
    fileType: FileType;

    @IsNumber()
    @IsOptional()
    additions?: number;

    @IsNumber()
    @IsOptional()
    deletions?: number;

    @IsString()
    @IsOptional()
    rawDiff?: string;

    @IsString()
    @IsOptional()
    aiAnalysisResult?: string;

    @IsEnum(FileStatus)
    @IsOptional()
    status?: FileStatus;

    @IsEnum(AiAnalysisStatus)
    @IsOptional()
    aiAnalysisStatus?: AiAnalysisStatus;
}