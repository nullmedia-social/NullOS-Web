export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: rmdir <dir>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (!(path in vfs)) return print('Directory not found');
	if (typeof vfs[path] !== 'object') return print('Not a directory');
	const hasChildren = Object.keys(vfs).some(key => key.startsWith(`${path}/`));
	if (hasChildren) return print('Directory not empty');
	delete vfs[path];
	save();
}