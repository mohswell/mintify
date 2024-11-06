import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { fileValidatorPipe } from 'src/constants/file-validator.pipe';
import { GenerateTextDto } from 'src/dto/generate-text.dto';
import { GeminiService } from 'src/gemini/application/gemini.service';
import { GenAiResponse } from 'src/types/GenAiResponse';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('text')
  generateText(@Body() dto: GenerateTextDto) {
    return this.geminiService.generateText(dto.prompt);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Prompt',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
      },
    },
  })
  @Post('text-and-image')
  @UseInterceptors(FileInterceptor('file'))
  async generateTextFromMultiModal(
    @Body() dto: GenerateTextDto,
    @UploadedFile(fileValidatorPipe)
    file: Express.Multer.File,
  ): Promise<GenAiResponse> {
    return this.geminiService.generateTextFromMultiModal(dto.prompt, file);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Prompt',
        },
        first: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
        second: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
      },
    },
  })
  @Post('analyse-the-images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'first', maxCount: 1 },
      { name: 'second', maxCount: 1 },
    ]),
  )
  async analyseImages(
    @Body() dto: GenerateTextDto,
    @UploadedFiles()
    files: {
      first?: Express.Multer.File[];
      second?: Express.Multer.File[];
    },
  ): Promise<GenAiResponse> {
    if (!files.first?.length) {
      throw new BadRequestException('The first image is missing');
    }

    if (!files.second?.length) {
      throw new BadRequestException('The second image is missing');
    }
    return this.geminiService.analyzeImages({ prompt: dto.prompt, firstImage: files.first[0], secondImage: files.second[0] });
  }

}
