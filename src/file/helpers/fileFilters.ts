import { BadRequestException } from "@nestjs/common";

export const myFileFilter = ( req: Express.Request,
    file: Express.Multer.File,
    callback: Function
) => {

    if (!file) return callback(
        new BadRequestException('File is missing'),
        false
    );
    
    const validMimeTypes: { [key: string]: string[] } = {
        "application/pdf": ["pdf"],
        "application/msword": ["doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
          "docx",
        ],
        "application/vnd.ms-excel": ["xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          "xlsx",
        ],
        "application/zip": ["zip"],
        "text/plain": ["txt"],
        "text/csv": ["csv"],
    };
    
    const validExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "zip",
        "txt",
        "csv",
    ];
    
    // Get the file extension from the original name
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    // Get the list of valid extensions for the given MIME type
    const allowedExtensionsForMime = validMimeTypes[file.mimetype];
    
    if (
        allowedExtensionsForMime &&
        allowedExtensionsForMime.includes(fileExtension) &&
        validExtensions.includes(fileExtension)
    ) {
        return callback(null, true);
    }
    
    return callback(
        new BadRequestException(
          `The file extension .${fileExtension} is not allowed, only [${validExtensions}]`
        ),
        false
    );
}
