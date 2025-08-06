export default async function(args, print, vfs, save, cwd) {
	if (!args[0]) return print('Usage: file <filename>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (!(path in vfs)) return print(`file: ${args[0]}: No such file`);
	if (typeof vfs[path] === 'string') print(`${args[0]}: text`);
	else print(`${args[0]}: directory`);
}