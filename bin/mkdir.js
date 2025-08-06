export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: mkdir <dir>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (vfs[path]) return print('Directory already exists');
	vfs[path] = { _isDir: true };
	save();
}