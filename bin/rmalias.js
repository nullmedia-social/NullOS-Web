export default function rmalias(args, print, _fs, _saveFS, _cwd, _setCWD, _setInterceptor, aliasMap, saveAliasMap) {
	if (args.length === 0) {
		print("Usage: rmalias <aliasName>");
		return;
	}

	const aliasName = args[0];

	if (!(aliasName in aliasMap)) {
		print(`Alias "${aliasName}" not found.`);
		return;
	}

	delete aliasMap[aliasName];
	saveAliasMap();
	print(`Alias "${aliasName}" removed.`);
}