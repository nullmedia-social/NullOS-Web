export default async function(args, print, _fs, _saveFS, _cwd, _setCWD, _setInterceptor, aliasMap, saveAliasMap) {
	if (args.length === 0) {
		print("Usages:");
		print("    alias name=\"command\"");
		print("    alias -l");
		print("    alias -l name");
		print("    alias -r name");
		return;
	}

	if (args[0] === '-l') {
		if (args.length === 1) {
			print("Aliases:");
			for (const name of Object.keys(aliasMap)) {
				print(`    ${name}`);
			}
		} else {
			const name = args[1];
			if (aliasMap[name]) {
				print(`${name}="${aliasMap[name].join(' ')}"`);
			} else {
				print(`Alias "${name}" not found.`);
			}
		}
		return;
	}

	if (args[0] === '-r') {
		if (args.length < 2) {
			print("Usage: alias -r <name>");
			return;
		}
		const name = args[1];
		if (aliasMap[name]) {
			delete aliasMap[name];
			saveAliasMap();
			print("Alias removed.");
		} else {
			print(`Alias "${name}" not found.`);
		}
		return;
	}

	for (let arg of args) {
		if (!arg.includes('=')) {
			print(`Invalid alias format: ${arg}`);
			continue;
		}

		const match = arg.match(/^([^=]+)=(.*)$/);
		if (!match) {
			print(`Invalid alias: ${arg}`);
			continue;
		}

		const name = match[1].trim();
		let value = match[2].trim();

		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		aliasMap[name] = value.split(/\s+/);
		saveAliasMap();
		print("Alias set.");
	}
}