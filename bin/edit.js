export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir, setCurrentDir, setInputInterceptor) {
	const fileArg = args[0];
	if (!fileArg) {
		outputLine('edit: missing filename');
		return;
	}

	// Normalize path
	function normalizePath(base, path) {
		if (path.startsWith('/')) return path;
		const baseParts = base === '/' ? [] : base.slice(1).split('/');
		const pathParts = path.split('/');
		const parts = [...baseParts];

		for (const part of pathParts) {
			if (part === '' || part === '.') continue;
			else if (part === '..') parts.pop();
			else parts.push(part);
		}
		return '/' + parts.join('/');
	}

	const fullPath = normalizePath(currentDir, fileArg);

	let lines = [];
	if (virtualFS[fullPath]) {
		lines = virtualFS[fullPath].split('\n');
	}

	outputLine(`Editing '${fullPath}' (type ".save" to save, ".exit" to cancel):`);
	lines.forEach(line => outputLine(line));

	setInputInterceptor(input => {
		if (input === '.save') {
			virtualFS[fullPath] = lines.join('\n');
			saveVirtualFS();
			outputLine(`File '${fullPath}' saved.`);
			return false; // stop intercepting
		} else if (input === '.exit') {
			outputLine(`Exited without saving '${fullPath}'.`);
			return false; // stop intercepting
		} else {
			lines.push(input);
			return true; // keep intercepting
		}
	});
}