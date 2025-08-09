export default async function(args, outputLine, virtualFS, saveVirtualFS) {
	const [cmdName] = args;

	if (!cmdName) {
		outputLine("npm: usage: npm <command>");
		return;
	}

	const url = `https://repo.os.null-web.vastserve.com/web/${cmdName}.js`;
	const destPath = `/bin/${cmdName}.js`;

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const text = await res.text();
		virtualFS[destPath] = text;
		saveVirtualFS();

		outputLine(`Installed '${cmdName}' to /bin/${cmdName}.js using Null Package Manager`);
	} catch (err) {
		outputLine(`npm: failed to fetch '${url}': ${err.message}`);
	}
}