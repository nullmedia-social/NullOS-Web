export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
  const filename = args[0];
  if (!filename) {
    outputLine('rm: missing filename');
    return;
  }

  function normalizePath(base, path) {
    if (path.startsWith('/')) return path;
    const baseParts = base === '/' ? [] : base.slice(1).split('/');
    const pathParts = path.split('/');
    const parts = [...baseParts];
    for (const part of pathParts) {
      if (part === '' || part === '.') continue;
      else if (part === '..') parts.pop();
      else parts.push(part);
    }
    return '/' + parts.join('/');
  }

  const fullPath = normalizePath(currentDir, filename);

  if (virtualFS.hasOwnProperty(fullPath)) {
    delete virtualFS[fullPath];
    saveVirtualFS();
    outputLine(`rm: removed '${fullPath}'`);
  } else {
    outputLine(`rm: cannot remove '${filename}': No such file in virtualFS`);
  }
}