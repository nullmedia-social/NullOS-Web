export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
  const filename = args[0];
  if (!filename) {
    outputLine('tee: missing filename');
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
  const content = args.slice(1).join(' ') || '';

  if (!virtualFS) {
    outputLine('tee: virtual file system not available');
    return;
  }

  virtualFS[fullPath] = content;
  saveVirtualFS();

  outputLine(`File '${fullPath}' saved.`);
}