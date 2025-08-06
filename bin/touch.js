export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: touch <filename>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (!(path in vfs)) {
		vfs[path] = '';
		save();
	}
}