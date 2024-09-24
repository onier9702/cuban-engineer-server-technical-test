import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, Query, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';

import { FileService } from './file.service';

import { AuthDecorator } from '../auth/decorators';

import { myFileFilter } from './helpers/fileFilters';
import { generateName } from './helpers/generateName';

import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

import { ListRoles } from '../auth/interfaces/list-roles';
import { PaginationFileDto } from './dto/pagination-file.dto';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // CREATE
  @Post('')
  @AuthDecorator()
  @UseInterceptors( FilesInterceptor('files', 1, {
    fileFilter: myFileFilter,
    storage: diskStorage({
      destination: './uploads',
      filename: generateName
    })
  }))
  create(
    @Body() createFileDto: CreateFileDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    
    if (!files || files.length === 0) {
      throw new BadRequestException('File is missing');
    }

    if (files.length > 1) {
      throw new BadRequestException('Only upload one file at a time please');
    }
  
    return this.fileService.create(createFileDto, files[0] );
  }

  // UPDATE
  @Patch(':id')
  @AuthDecorator()
  update(
    @Body() updateFileDto: UpdateFileDto,
    @Param('id') id: string,
  ) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Get('/download/:id')
  downloadOne(@Param('id') id: string, @Res() response: Response) {
    return this.fileService.download(+id, response);
  }

  @Get('')
  findAll(@Query() paginationFileDto: PaginationFileDto) {
    return this.fileService.findAll(paginationFileDto);
  }

  @Delete(':id')
  @AuthDecorator(ListRoles.super_admin, ListRoles.admin)
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }

}


