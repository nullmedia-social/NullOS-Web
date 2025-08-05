export default async function(args, outputLine, virtualFS, saveVirtualFS) {
    const filename = args[0];
    if (!filename) {
        outputLine('tee: missing filename');
        return;
    }

    const content = args.slice(1).join(' ') || '';

    if (!virtualFS) {
        outputLine('tee: virtual file system not available');
        return;
    }

    virtualFS[filename] = content;
    saveVirtualFS();

    outputLine(`File '${filename}' saved.`);
}