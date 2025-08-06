export default async function(args, print, vfs, save, cwd) {
  if (args.length < 2) return print('Usage: mv <src> <dest>');

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

  const src = normalizePath(cwd, args[0]);
  const dest = normalizePath(cwd, args[1]);

  if (!(src in vfs)) return print(`mv: cannot stat '${args[0]}': No such file`);
  vfs[dest] = vfs[src];
  delete vfs[src];
  save();
}