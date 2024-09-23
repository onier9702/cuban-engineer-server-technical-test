import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class PaginationFileDto {

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit: number = 10;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    offset: number = 0;

}
