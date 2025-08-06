export default async function(args, print, vfs, save, cwd, setCwd, setInterceptor) {
	if (!args[0]) return print('Usage: nsh <script.nsh>');
	const path = `${cwd}/${args[0]}`.replace(/\/+/g, '/');
	if (!(path in vfs)) return print('No such script');

	const lines = vfs[path].split('\n');
	let index = 0;

	async function runNext() {
		if (index >= lines.length) return;
		const line = lines[index++].trim();
		if (!line || line.startsWith('#')) return runNext(); // skip comments
		const [cmd, ...cmdArgs] = line.split(/\s+/);
		try {
			const module = await import(`./${cmd}.js`);
			if (typeof module.default === 'function') {
				await module.default(cmdArgs, print, vfs, save, cwd, setCwd, setInterceptor);
			} else print(`${cmd}: not executable`);
		} catch {
			print(`${cmd}: command not found`);
		}
		runNext();
	}

	runNext();
}