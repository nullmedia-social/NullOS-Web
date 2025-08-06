export default async function(args, print, vfs, save, cwd) {
  if (args.length < 2) return print('Usage: diff <file1> <file2>');

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

  const path1 = normalizePath(cwd, args[0]);
  const path2 = normalizePath(cwd, args[1]);

  async function getFileContent(path) {
    if (vfs[path]) return vfs[path];
    // try fetching real file
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Not found');
      return await res.text();
    } catch {
      return null;
    }
  }

  const [content1, content2] = await Promise.all([getFileContent(path1), getFileContent(path2)]);

  if (content1 === null || content2 === null) {
    return print('One or both files do not exist');
  }

  const lines1 = content1.split('\n');
  const lines2 = content2.split('\n');
  const maxLines = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLines; i++) {
    if (lines1[i] !== lines2[i]) {
      print(`-${lines1[i] || ''}`);
      print(`+${lines2[i] || ''}`);
    }
  }
}