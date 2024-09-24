import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1727131915613 implements MigrationInterface {
    name = 'Migration1727131915613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`auth\` (
                \`uid\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`token\` varchar(128) NULL,
                \`roles\` text NOT NULL DEFAULT 'USER',
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                UNIQUE INDEX \`IDX_b54f616411ef3824f6a5c06ea4\` (\`email\`),
                PRIMARY KEY (\`uid\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`file\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`url\` varchar(255) NOT NULL,
                \`size\` int NOT NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'created',
                \`active\` tinyint NOT NULL DEFAULT 1,
                UNIQUE INDEX \`IDX_df16ff3255e6dfc777b086949b\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_df16ff3255e6dfc777b086949b\` ON \`file\`
        `);
        await queryRunner.query(`
            DROP TABLE \`file\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b54f616411ef3824f6a5c06ea4\` ON \`auth\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth\`
        `);
    }

}
