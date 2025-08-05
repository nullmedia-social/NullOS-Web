export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
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
    const virtualEntriesSet = new Set();
    for (const path in virtualFS) {
      const normPath = path.startsWith('/') ? path : '/' + path;

      if (!normPath.startsWith(targetDir.endsWith('/') ? targetDir : targetDir + '/')) continue;

      const relativePath = normPath.slice(targetDir.length);
      const trimmed = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

      const firstPart = trimmed.split('/')[0];
      if (firstPart) virtualEntriesSet.add(firstPart);
    }

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