import { IsString, MinLength } from "class-validator";


export class CreateFileDto {

    @IsString()
    @MinLength(2)
    name: string;

}
