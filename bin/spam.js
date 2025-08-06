export default async function spam(args, print, vfs, saveVFS, currentDir, setCurrentDir, setInputInterceptor) {
	if (args.length === 0) {
		print("Usage: spam [text]");
		return;
	}

	let stop = false;
	const text = args.join(' ');

	function stopIfC(input) {
		if (input.trim().toLowerCase() === 'c') {
			stop = true;
			print("[spam stopped]");
			return false; // cancel interceptor
		}
		return true; // keep listening
	}

	setInputInterceptor(stopIfC);

	async function loop() {
		while (!stop) {
			print(text);
			await new Promise(r => setTimeout(r, 100)); // delay to prevent instant overload
		}
	}

	loop();
}