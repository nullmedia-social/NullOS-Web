export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
  // Normalize a path from currentDir + arg
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

  const targetDir = normalizePath(currentDir, args[0] || '.');

  try {
    const res = await fetch('/bin/assets/files.json');
    if (!res.ok) throw new Error('Failed to fetch file list');
    const fileTree = await res.json();

    const realFiles = fileTree[targetDir] || [];

    // Get virtual entries under targetDir
    const virtualPaths = Object.keys(virtualFS);

    const filteredVirtualPaths = virtualPaths.filter(p => {
      const normalized = p.startsWith('/') ? p : '/' + p;
      return normalized.startsWith(targetDir === '/' ? '/' : targetDir + '/');
    });

    const virtualEntriesSet = new Set();
    for (const p of filteredVirtualPaths) {
      let relative = p.slice(targetDir.length);
      if (relative.startsWith('/')) relative = relative.slice(1);
      const firstPart = relative.split('/')[0];
      if (firstPart) virtualEntriesSet.add(firstPart);
    }

    // Merge and dedupe real and virtual
    const combinedSet = new Set([...realFiles, ...virtualEntriesSet]);
    const combined = Array.from(combinedSet).sort();

    if (combined.length === 0) {
      outputLine(`ls: cannot access '${targetDir}': No such directory`);
      return;
    }

    outputLine(combined.join('    '));
  } catch (err) {
    outputLine('ls: error fetching directory contents');
  }
}