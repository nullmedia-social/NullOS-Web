export default async function(args, print, virtualFS) {
  if (args.length === 0) {
    print("Usage: which <command>");
    return;
  }

  const checkPaths = (cmd) => [
    `bin/${cmd}`,
    `bin/${cmd}.js`,
    `${cmd}`,
    `${cmd}.js`
  ];

  const pathExists = async (path) => {
    if (virtualFS[path]) return true;

    try {
      await import(`../${path}`);
      return true;
    } catch {
      return false;
    }
  };

  for (const cmd of args) {
    let found = null;

    for (const path of checkPaths(cmd)) {
      if (await pathExists(path)) {
        found = '/' + path; // simulate absolute path
        break;
      }
    }

    if (found) {
      print(found);
    } else {
      print(`${cmd}: not found`);
    }
  }
}