export default async function(args, outputLine, virtualFS, saveVirtualFS) {
    const filename = args[0];
    if (!filename) {
        outputLine('edit: missing filename');
        return;
    }

    const content = args.slice(1).join(' ') || '';

    if (!virtualFS) {
        outputLine('edit: virtual file system not available');
        return;
    }

    virtualFS[filename] = content;
    saveVirtualFS();

    outputLine(`File '${filename}' saved.`);
}