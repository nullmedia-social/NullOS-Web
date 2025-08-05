export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir) {
    const fileArg = args[0];
    if (!fileArg) {
        outputLine("cat: missing filename");
        return;
    }

    // Normalize path helper (same as other commands)
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

    const file = normalizePath(currentDir, fileArg);

    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error('Not found on server');
        const text = await res.text();
        text.split('\n').forEach(line => outputLine(line));
    } catch {
        if (virtualFS && virtualFS[file]) {
            virtualFS[file].split('\n').forEach(line => outputLine(line));
        } else {
            outputLine(`cat: ${fileArg}: No such file`);
        }
    }
}