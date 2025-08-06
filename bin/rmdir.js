export default async function(args, print, vfs, save, cwd) {
  if (!args[0]) return print('Usage: rmdir <dir>');

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

  const path = normalizePath(cwd, args[0]);

  if (!(path in vfs)) return print('Directory not found');
  if (typeof vfs[path] !== 'object') return print('Not a directory');
  const hasChildren = Object.keys(vfs).some(key => key.startsWith(`${path}/`));
  if (hasChildren) return print('Directory not empty');
  delete vfs[path];
  save();
}