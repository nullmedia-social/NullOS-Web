export default async function(args, print, vfs, save, cwd) {
  if (args.length < 2) return print('Usage: cp <src> <dest>');

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

  if (vfs.hasOwnProperty(src)) {
    // copy from virtualFS
    vfs[dest] = vfs[src];
    save();
    print(`cp: copied virtual file '${src}' to '${dest}'`);
    return;
  }

  // if not in virtualFS, check real FS
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`File not found on server`);

    const text = await res.text();
    vfs[dest] = text;
    save();
    print(`cp: copied real file '${src}' to virtual '${dest}'`);
  } catch (err) {
    print(`cp: cannot stat '${args[0]}': No such file`);
  }
}