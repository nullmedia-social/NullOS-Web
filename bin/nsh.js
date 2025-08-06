export default async function(args, print, vfs, save, cwd, setCwd, setInterceptor) {
  if (args.length !== 2 || args[0] !== '-c') {
    return print('Usage: nsh -c <script.nsh>');
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

  const path = normalizePath(cwd, args[1]);
  if (!(path in vfs)) return print('No such script');

  const lines = vfs[path].split('\n');
  let index = 0;

  async function runNext() {
    if (index >= lines.length) return;
    const line = lines[index++].trim();
    if (!line || line.startsWith('#')) return runNext(); // skip comments
    const [cmd, ...cmdArgs] = line.split(/\s+/);
    try {
      const module = await import(`./${cmd}.js`);
      if (typeof module.default === 'function') {
        await module.default(cmdArgs, print, vfs, save, cwd, setCwd, setInterceptor);
      } else {
        print(`${cmd}: not executable`);
      }
    } catch {
      print(`${cmd}: command not found`);
    }
    runNext();
  }

  runNext();
}