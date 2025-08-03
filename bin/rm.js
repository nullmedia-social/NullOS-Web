export default async function(args, outputLine, virtualFS, saveVirtualFS) {
  const filename = args[0];
  if (!filename) {
    outputLine('rm: missing filename');
    return;
  }
  if (virtualFS.hasOwnProperty(filename)) {
    delete virtualFS[filename];
    saveVirtualFS();
    outputLine(`rm: removed '${filename}'`);
  } else {
    outputLine(`rm: cannot remove '${filename}': No such file in virtualFS`);
  }
}