import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('auth')
export class Auth {

    @PrimaryGeneratedColumn()
    uid: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ length: 128, nullable: true, default: null })
    token?: string;

    @Column( { type: 'simple-array' , default: 'USER'} )
    roles?: string[];

    @Column( { type: 'boolean', default: true } )
    isActive?: boolean;

    // Relations
    // @OneToMany(
    //     () => Bag,
    //     file => file.user,
    // )
    // files?: File[];

}
