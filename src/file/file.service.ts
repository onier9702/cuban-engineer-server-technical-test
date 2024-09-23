import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

import { File } from './entities/file.entity';

import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

import { Message } from '../interfaces/message';
import { StatusFile } from '../enum/file.enum';
import { PaginationFileDto } from './dto/pagination-file.dto';
import { ICountAndTotalFile } from 'src/interfaces/file';

@Injectable()
export class FileService {

  constructor(

    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,

  ) {}

  // CREATE
  public async create(
    createFileDto: CreateFileDto,
    pathfile: string,
  ): Promise<Message> {
      
    try {

      const { name } = createFileDto;

      // Verify duplicity in files by name
      const file = await this.fileRepository.findOneBy({name});
      if ( file ) {
        throw new BadRequestException(`File with name ${name} already exists on database.`);
      }
      
      const newFile = this.fileRepository.create({
        name: name.toUpperCase(),
        active: true,
      });

      await this.fileRepository.save(newFile);

      return {
        msg: 'File was uploaded successfully',
      }
      
    } catch (error) {
      // Make sure to keep FS clean of images
      this.removeImageFromFS(pathfile);

      this.handleExceptionsErrorOnDB(error);
    }
  }

  public async update(
    id: number,
    updateFileDto: UpdateFileDto,
  ): Promise<Message> {

    await this.findOneQuery( id );
    const { name } = updateFileDto;

    try {

      const fileUpdated = await this.fileRepository.preload({
        id,
        name: name.toUpperCase(),
        status: StatusFile.UPDATED,
      });

      await this.fileRepository.save(fileUpdated);

      return {
        msg: `File name was updated successfully.`,
      }
      
    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }

  }

  // methods to keep uploads directory clean
  private getStaticFile( fileName: string ): string {

    const path = join( __dirname, '../../uploads/files', fileName ); // create a physic path to get file name if it exists
    if ( !existsSync(path) ) {
      throw new BadGatewayException( `No file found with path ${fileName}` );
    }
    // if file with that name exists, return that name path
    return path;
  }

  private deleteFileFromFs( path: string ): void {
      unlinkSync(path);
  }

  // in case the creation, I need to remove the file from fs
  private removeImageFromFS( path: string ) {
    const divisionPath = path.split('files/');
    const filename = divisionPath[ divisionPath.length - 1];
    const pathFromFs = this.getStaticFile(filename);
    this.deleteFileFromFs(pathFromFs);
  }

  // FIND ALL File on DB
  public async findAll(
    paginationFileDto: PaginationFileDto
  ): Promise<ICountAndTotalFile> {

    const { limit, offset } = paginationFileDto;

    try {

      const qb = this.fileRepository.createQueryBuilder('f')
        .where('f.active = :active', { active: true });

      const [allFiles, total] = await qb
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      return {
        count: total,
        files: allFiles
      }
      
    } catch (error) {
      this.handleExceptionsErrorOnDB( error );
    }
  }

  // FIND ONE By name or ID
  public async findOne(id: number): Promise<any> { 
    
    try {
      
      const file = await this.fileRepository.findOneBy( { id, active: true } );
      if ( !file ) throw new NotFoundException(`File with ID: ${id} not found`);

      // return this.plainDataProduct(product);
      return file;

    } catch (error) {
      this.handleExceptionsErrorOnDB(error);
    }

  }

  public async remove(id: number): Promise<Message> {
    const file = await this.findOneQuery( id );
    if ( !file ) {
      throw new BadRequestException(`File with ID:${id} not found or was already deleted`);
    }

    await this.fileRepository.update(
      { id: file.id },
      { active: false, status: StatusFile.DELETED },
    );

    return {
      msg: `File was soft deleted successffully`,
    };
  }

  private async findOneQuery(id: number): Promise<File> {
    const file = await this.fileRepository.findOneBy( { id, active: true } );
    if ( !file ) throw new BadRequestException(`File with ID: ${id} not found`);
    
    return file;
  }

  private handleExceptionsErrorOnDB( err: any ) {
    if (err.response?.statusCode === 400) {
      throw new BadRequestException(err.response.message);
    }

    const { errno, sqlMessage } = err;    
    if ( errno === 1062 || errno === 1364 ) throw new BadRequestException(sqlMessage);

    console.log('Customize-Error-File-service: ', err);
    throw new InternalServerErrorException('Error not implemented - file-service: check --logs-- in console');  
    
  }

}
