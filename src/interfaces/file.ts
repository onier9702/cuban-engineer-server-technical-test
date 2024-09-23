import { File } from "src/file/entities/file.entity";

export interface ICountAndTotalFile {
    count: number;
    files: File[];
}
