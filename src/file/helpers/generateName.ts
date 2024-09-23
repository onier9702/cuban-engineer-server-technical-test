import { v4 as uuid } from 'uuid';

export const generateName = ( req: Express.Request, 
    file: Express.Multer.File, 
    callback: Function
) => {
    
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    const nameGenerated = `files/${uuid()}.${fileExtension}`;

    return callback(null, nameGenerated);
    
}
