export default async function(args, print, vfs, save, cwd) {
	if (args.length < 2) return print('Usage: mv <src> <dest>');
	const src = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	const dest = `${cwd}/${args[1]}`.replace(/\/+/g, '/');
	if (!(src in vfs)) return print(`mv: cannot stat '${args[0]}': No such file`);
	vfs[dest] = vfs[src];
	delete vfs[src];
	save();
}