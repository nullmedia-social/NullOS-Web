export default async function(args, outputLine, virtualFS, saveVirtualFS) {
  localStorage.removeItem('virtualFS');
  outputLine('Virtual file system cleared.');
};