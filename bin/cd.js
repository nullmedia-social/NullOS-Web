export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir, setCurrentDir) {
  const pathArg = args[0];
  if (!pathArg) {
    outputLine('cd: missing argument');
    return;
  }

  // Normalize a path given base + input
  function normalizePath(base, path) {
    if (!path) return base;
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

  const targetDir = normalizePath(currentDir, pathArg);

  try {
    // Fetch real file structure
    const res = await fetch('/bin/assets/files.json');
    if (!res.ok) throw new Error('Failed to fetch file list');
    const fileTree = await res.json();

    const existsInRealFS = targetDir in fileTree;

    // See if any virtualFS path is inside or equal to targetDir
    const existsInVirtualFS = Object.keys(virtualFS).some(p => {
      const full = p.startsWith('/') ? p : '/' + p;
      return full === targetDir || full.startsWith(targetDir + '/');
    });

    if (existsInRealFS || existsInVirtualFS) {
      setCurrentDir(targetDir);
      outputLine(`Changed directory to ${targetDir}`);
    } else {
      outputLine(`cd: no such file or directory: ${pathArg}`);
    }
  } catch (err) {
    outputLine(`cd: error checking directory`);
  }
}