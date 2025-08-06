export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: wc <file>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (!(path in vfs)) return print(`wc: ${args[0]}: No such file`);
	const content = vfs[path];
	const lines = content.split('\n').length;
	const words = content.trim().split(/\s+/).length;
	const chars = content.length;
	print(`${lines} ${words} ${chars} ${args[0]}`);
}