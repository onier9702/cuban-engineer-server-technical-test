import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { File } from './entities/file.entity';

import { FileService } from './file.service';
import { FileController } from './file.controller';


@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [

    TypeOrmModule.forFeature([ File ]),
    AuthModule,

  ],
  exports: [
    TypeOrmModule,
    FileService,
  ]

})
export class FileModule {}
