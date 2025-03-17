const FILE_SIZE = 2000000;

const SUPPORTED_FORMATS_IMAGE = [
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/png'
];

const SUPPORTED_FORMATS_DOC = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf',
    'application/vnd.rar'
];

const mobileRegExp = /^(?:(?:\+|0{0,2})91(\s*|[-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;

const getFilePath = (value, path, returnType = true) => {
 
    if (['', null].includes(value)) {
        console.log(process.env.BASEURL)
        return returnType ? `${process.env.BASEURL}uploads/avatar.png` : null
    } else {
        return `${process.env.BASEURL}uploads/${path}/${value}`;
    }
}

export { FILE_SIZE, SUPPORTED_FORMATS_IMAGE, SUPPORTED_FORMATS_DOC, mobileRegExp, getFilePath }