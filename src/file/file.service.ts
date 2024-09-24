import { BadGatewayException, BadRequestException, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { createWriteStream, existsSync, promises, unlinkSync } from 'fs';
import * as archiver from 'archiver';
import { Response } from 'express';

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
    fileObject: Express.Multer.File,
  ): Promise<any> {
      
    try {

      const { name } = createFileDto;
      
      // Verify duplicity in files by name
      const file = await this.fileRepository.findOneBy({name});
      if ( file ) {
        throw new BadRequestException(`File with name ${name} already exists on database.`);
      }

      // Create the zip file
      const zipFilePath = await this.createZipFile(fileObject);

      // remove file to only have the one with .zip extension
      this.removeImageFromFS(fileObject.path);

      // Get the size of the generated zip file
      const zipFileStats = await promises.stat(zipFilePath);
      const zipFileSize = zipFileStats.size; // Size in bytes

      // Create URL with .zip extension
      const partsUrl = fileObject.path.split('.');
      const url = `${partsUrl[0]}.zip`;

      const newFile = this.fileRepository.create({
          name: name.toUpperCase(),
          url,
          size: zipFileSize, // Use the size of the zip file
          active: true,
      });

      await this.fileRepository.save(newFile);

      return {
        msg: 'File was uploaded successfully',
      }
      
    } catch (error) {
      // Make sure to keep FS clean of images
      this.removeImageFromFS(fileObject.path);

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

  public async download(fileId: number, res: Response): Promise<void> {
    try {
      const file = await this.findOneQuery(fileId);

      if (!file) {
        throw new NotFoundException(`File with ID: ${fileId} not found`);
      }

      const fileName = file.url.split('files/')[1];
      const pathFile = this.getStaticFile(fileName);

      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', 'application/zip');

      // Stream the file to the client
      res.sendFile(pathFile, (err) => {
        if (err) {
          console.error('Error while sending file:', err);
          throw new InternalServerErrorException('Error occurred while downloading the file');
        }
      });
      
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error.message || 'Unknown error',
      });
    }
  }

  public async findAll(
    paginationFileDto: PaginationFileDto
  ): Promise<ICountAndTotalFile> {

    const { limit, offset } = paginationFileDto;

    try {

      const qb = this.fileRepository.createQueryBuilder('f')
        .where('f.active = :active', { active: true })
        .orderBy('f.id', 'DESC');

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

  private async createZipFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = 'uploads';
    const filePath = `${uploadDir}/${file.filename}`;
    
    // Set the zip file name to just the UUID with .zip extension
    const zipFileName = `${file.filename.split('.')[0]}.zip`; // Only keep the UUID part
    const zipFilePath = `${uploadDir}/${zipFileName}`; // Save as UUID.zip

    // Create a file stream for the zip file
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Set the compression level

    return new Promise<string>((resolve, reject) => {
        output.on('close', () => {
            resolve(zipFilePath); // Return the path of the created zip file
        });

        output.on('end', () => {
            console.log('Data has been drained');
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn(err);
            } else {
                reject(err);
            }
        });

        archive.on('error', (err) => {
            reject(err);
        });

        // Pipe the archive data to the file
        archive.pipe(output);

        // Append the original file to the archive
        archive.file(filePath, { name: file.originalname });

        // Finalize the archive (i.e., the zip file)
        archive.finalize();
    });
  }

  private async findOneQuery(id: number): Promise<File> {
    const file = await this.fileRepository.findOneBy( { id, active: true } );
    if ( !file ) throw new BadRequestException(`File with ID: ${id} not found`);
    
    return file;
  }

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

  // in case the creation failed, I need to remove the file from fs
  private removeImageFromFS( path: string ) {
    const divisionPath = path.split('files/');
    const filename = divisionPath[ divisionPath.length - 1];
    const pathFromFs = this.getStaticFile(filename);
    this.deleteFileFromFs(pathFromFs);
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
