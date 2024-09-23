import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export class ConfigDB {

  static getTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {

    return {
      type: 'mariadb',
      host: 'mariadb',
      port: +configService.get('DB_PORT'),
      database: configService.get('DB_NAME'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      entities: ["dist/**/*.entity{ .ts,.js}"],
      migrations: ["dist/db/migrations/*{.ts,.js}"],
      autoLoadEntities: false,
      synchronize: false,
    }
  }

}
