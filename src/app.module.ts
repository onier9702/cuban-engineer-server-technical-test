import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';

import { ConfigDB } from './db/config';

@Module({
  imports: [

    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    
    // TypeOrmConfig
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return ConfigDB.getTypeOrmOptions(configService);
      },
      // This imports allow the typeOrm connect with Mysql and use .env without errors
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    AuthModule,
    FileModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
