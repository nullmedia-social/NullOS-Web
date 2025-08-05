export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
	const [url, destPath] = args;

	if (!url || !destPath) {
		outputLine("download: usage: download <url> <dest path>");
		return;
	}

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const text = await res.text();

		// Normalize destination path
		const fullPath = destPath.startsWith('/')
			? destPath
			: (currentDir === '/' ? '/' : currentDir + '/') + destPath;

		virtualFS[fullPath] = text;
		saveVirtualFS();

		outputLine(`Downloaded and saved to '${fullPath}'`);
	} catch (err) {
		outputLine(`download: failed to fetch '${url}': ${err.message}`);
	}
}