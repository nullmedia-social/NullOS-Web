const aliases = {};

export default async function(args, print) {
	if (args.length === 0) {
		for (const [k, v] of Object.entries(aliases)) {
			print(`alias ${k}='${v}'`);
		}
		return;
	}
	for (const arg of args) {
		const [name, value] = arg.split('=');
		if (value) {
			aliases[name] = value.replace(/^'+|'+$/g, '');
		}
	}
}

export function getAliases() {
	return aliases;
}