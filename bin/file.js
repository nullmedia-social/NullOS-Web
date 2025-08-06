export default async function(args, print, vfs, save, cwd) {
  if (!args[0]) return print('Usage: file <filename>');

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

  if (!(path in vfs)) return print(`file: ${args[0]}: No such file`);
  if (typeof vfs[path] === 'string') print(`${args[0]}: text`);
  else print(`${args[0]}: directory`);
}