export default async function(args, print, vfs, save, cwd) {
	if (args.length < 2) return print('Usage: diff <file1> <file2>');
	const path1 = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	const path2 = `${cwd}/${args[1]}`.replace(/\/+/g, '/');
	if (!(path1 in vfs) || !(path2 in vfs)) return print('One or both files do not exist');
	const lines1 = vfs[path1].split('\n');
	const lines2 = vfs[path2].split('\n');
	const maxLines = Math.max(lines1.length, lines2.length);
	for (let i = 0; i < maxLines; i++) {
		if (lines1[i] !== lines2[i]) {
			print(`-${lines1[i] || ''}`);
			print(`+${lines2[i] || ''}`);
		}
	}
}