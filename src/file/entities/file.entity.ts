import { StatusFile } from "src/enum/file.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('file')
export class File {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    url: string; // conformed by path directory => 'file/' + UUID

    @Column()
    size: number;

    @Column({ default: StatusFile.CREATED })
    status: string;

    @Column({ type: 'boolean', default: true })
    active: boolean;

}