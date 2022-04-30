import FS from "fs";

const javascriptFile = /\.js$/;

export const getFilePaths = (baseDirectory: string, filePaths: string[] = []) => {
  const directoryContents = FS.readdirSync(baseDirectory);
  directoryContents.forEach((content) => {
    const combinedPath = `${baseDirectory}/${content}`;
    if (FS.statSync(combinedPath).isDirectory()) {
      getFilePaths(combinedPath, filePaths);
    } else if (javascriptFile.test(combinedPath)) {
      filePaths.push(combinedPath);
    }
  });
  return filePaths;
};
