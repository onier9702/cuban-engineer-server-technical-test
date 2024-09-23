import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateAuthDto {

    @IsString()
    @MinLength(2)
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

}
