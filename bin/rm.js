export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
  const filename = args[0];
  if (!filename) {
    outputLine('rm: missing filename');
    return;
  }

  const fullPath = filename.startsWith('/')
    ? filename
    : (currentDir === '/' ? '/' : currentDir + '/') + filename;

  if (virtualFS.hasOwnProperty(fullPath)) {
    delete virtualFS[fullPath];
    saveVirtualFS();
    outputLine(`rm: removed '${fullPath}'`);
  } else {
    outputLine(`rm: cannot remove '${filename}': No such file in virtualFS`);
  }
}