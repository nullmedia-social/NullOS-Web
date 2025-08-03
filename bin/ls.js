export default async function(args, outputLine) {
  const inputDir = args[0] || '/';
  const dir = inputDir.startsWith('/') ? inputDir : '/' + inputDir;

  try {
    const res = await fetch('/bin/assets/files.json');
    if (!res.ok) throw new Error('Failed to fetch file list');
    const fileTree = await res.json();

    // Load virtualFS from localStorage
    let virtualFS = JSON.parse(localStorage.getItem('virtualFS') || '{}');

    // Normalize keys in virtualFS to start with '/'
    virtualFS = Object.fromEntries(
      Object.entries(virtualFS).map(([k, v]) => [k.startsWith('/') ? k : '/' + k, v])
    );

    // Real files in directory
    const realFiles = fileTree[dir] || [];

    // Collect virtual files or subdirectories directly inside the dir
    const prefix = dir === '/' ? '/' : dir + '/';
    const virtualFilesSet = new Set();

    for (const filepath in virtualFS) {
      if (filepath.startsWith(prefix)) {
        const remainder = filepath.slice(prefix.length);
        if (remainder) {
          // get first part of the remainder path
          const firstPart = remainder.split('/')[0];
          virtualFilesSet.add(firstPart);
        }
      }
    }

    const virtualFiles = Array.from(virtualFilesSet);

    // Check if directory exists either in real FS or virtual FS
    const dirExistsInReal = dir in fileTree;
    const dirExistsInVirtual = virtualFiles.length > 0;

    if (!dirExistsInReal && !dirExistsInVirtual) {
      outputLine(`ls: cannot access '${dir}': No such directory`);
      return;
    }

    // Combine and remove duplicates
    const combinedFiles = Array.from(new Set([...realFiles, ...virtualFiles]));

    outputLine(combinedFiles.join('    '));
  } catch (err) {
    outputLine('ls: error fetching directory contents');
  }
}