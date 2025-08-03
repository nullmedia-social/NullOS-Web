export default async function(args, outputLine, virtualFS) {
    const file = args[0];
    if (!file) {
        outputLine("cat: missing filename");
        return;
    }
    try {
        const res = await fetch(file);
        if (!res.ok) throw new Error('Not found on server');
        const text = await res.text();
        text.split('\n').forEach(line => outputLine(line));
    } catch {
        if (virtualFS && virtualFS[file]) {
            virtualFS[file].split('\n').forEach(line => outputLine(line));
        } else {
            outputLine(`cat: ${file}: No such file`);
        }
    }
}