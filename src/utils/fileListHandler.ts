// isFileList is a type guard that checks if the value is a FileList and makes sure that the value is not null or undefined.
export const isFileList = (value: File | FileList): value is FileList => {
    return typeof FileList !== "undefined" && value instanceof FileList;
};
