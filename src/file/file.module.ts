import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileService } from './file.service';
import { FileController } from './file.controller';

import { AuthModule } from '../auth/auth.module';

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
