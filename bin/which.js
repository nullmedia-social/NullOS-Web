export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: which <command>');
	const cmd = args[0];
	const paths = [`/bin/${cmd}`, `/bin/${cmd}.js`, `/${cmd}`, `/${cmd}.js`, `${cwd}/${cmd}`, `${cwd}/${cmd}.js`];
	for (const p of paths) {
		if (vfs[p]) return print(p);
	}
	print(`${cmd}: not found`);
}