export default async function spam(args, print, vfs, saveVFS, currentDir, setCurrentDir, setInputInterceptor) {
	if (args.length === 0) {
		print("Usage: spam [text]");
		print("       spam --real");
		return;
	}

	let stop = false;

	function stopIfC(input) {
		if (input.trim().toLowerCase() === 'c') {
			stop = true;
			print("[spam stopped]");
			return false; // cancel interceptor
		}
		return true; // keep listening
	}

	setInputInterceptor(stopIfC);

	// --- SPAM IMAGE MODE ---
	if (args[0] === '--real') {
		const imgURL = 'https://th.bing.com/th/id/OIP.pvuyBHSn4HWsC14IBXfumwHaHa?r=0&rs=1&pid=ImgDetMain';

		async function loopImages() {
			while (!stop) {
				const img = document.createElement('img');
				img.src = imgURL;
				img.alt = 'SPAM';
				img.style.width = '64px';
				img.style.height = '64px';
				img.style.margin = '4px';

				// add to output container
				const output = document.querySelector('#output') || document.body;
				output.appendChild(img);

				await new Promise(r => setTimeout(r, 100));
			}
		}

		await loopImages();
		return;
	}

	// --- TEXT MODE ---
	const text = args.join(' ');

	async function loopText() {
		while (!stop) {
			print(text);
			await new Promise(r => setTimeout(r, 100));
		}
	}

	document.getElementById('terminalInput').textContent = "";
	await loopText();
}