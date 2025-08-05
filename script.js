document.addEventListener('DOMContentLoaded', () => {
	const prompt = document.querySelector('.prompt');
	let currentDir = '/';
	const terminalInput = document.getElementById('terminalInput');
	const output = document.getElementById('output');

	let commandHistory = [];
	let historyIndex = -1;

	const virtualFS = JSON.parse(localStorage.getItem('virtualFS') || '{}');
	function saveVirtualFS() {
		localStorage.setItem('virtualFS', JSON.stringify(virtualFS));
	}

	function setCurrentDir(newDir) {
		currentDir = newDir;
	}

	let inputInterceptor = null;
	function setInputInterceptor(handler) {
		inputInterceptor = handler;
	}

	function updateCaretPos() {
		const sel = window.getSelection();
		if (!sel.rangeCount) return;
		const range = sel.getRangeAt(0);
		const pos = range.startOffset;
		terminalInput.style.setProperty('--caret-pos', pos);
	}

	async function runCmd(cmd) {
		if (!cmd.trim()) return;

		function cmdOutput(text) {
			const line = document.createElement('div');
			line.textContent = text;
			output.appendChild(line);
		}

		const cleanCmd = cmd.trim();
		const [cmdName, ...args] = cleanCmd.split(' ');

		commandHistory.push(cmd);
		historyIndex = commandHistory.length;

		const inputLine = document.createElement('div');
		inputLine.innerHTML = `<span class="prompt">root@nullos:${currentDir}$</span> ${cmd}`;
		output.appendChild(inputLine);

		try {
			// Try to import from real /bin folder (server)
			const module = await import(`./bin/${cmdName}.js`);
			if (typeof module.default === 'function') {
				await module.default(
					args,
					cmdOutput,
					virtualFS,
					saveVirtualFS,
					currentDir,
					setCurrentDir,
					setInputInterceptor
				);
			} else {
				cmdOutput(`Error: ${cmdName} is not executable`);
			}
		} catch (err) {
			// Failed to import real file, try virtualFS
			const cmdPathBase = currentDir === '/' ? '' : currentDir;
			const virtualCmdKeys = [
				`${currentDir}/${cmdName}`,
				`${currentDir}/${cmdName}.js`,
				`/bin/${cmdName}`,
				`/bin/${cmdName}.js`,
				`/${cmdName}`,
				`/${cmdName}.js`
			];

			let foundVirtualCmd = false;

			for (const key of virtualCmdKeys) {
				if (virtualFS[key]) {
					foundVirtualCmd = true;
					try {
						const virtualCode = virtualFS[key];
						const blob = new Blob([virtualCode], { type: 'application/javascript' });
						const url = URL.createObjectURL(blob);
						const module = await import(url);
						if (typeof module.default === 'function') {
							await module.default(
								args,
								cmdOutput,
								virtualFS,
								saveVirtualFS,
								currentDir,
								setCurrentDir,
								setInputInterceptor
							);
						} else {
							cmdOutput(`Error: ${cmdName} (virtual) is not executable`);
						}
						URL.revokeObjectURL(url);
					} catch (virtualErr) {
						cmdOutput(`Error running virtual command: ${virtualErr.message}`);
					}
					break;
				}
			}

			if (!foundVirtualCmd) {
				cmdOutput(`Error: command not found: ${cmdName}`);
			}
		}

		prompt.textContent = `root@nullos:${currentDir}$`;
		terminalInput.textContent = '';
		updateCaretPos();
	}

	terminalInput.addEventListener('input', updateCaretPos);
	terminalInput.addEventListener('click', updateCaretPos);
	terminalInput.addEventListener('keyup', (e) => {
		updateCaretPos();

		if (e.key === 'Enter') {
			e.preventDefault();
			const input = terminalInput.textContent;

			if (inputInterceptor) {
				const shouldContinue = inputInterceptor(input);
				if (!shouldContinue) inputInterceptor = null;
				terminalInput.textContent = '';
				updateCaretPos();
				return;
			}

			runCmd(input);
		} else if (e.key === 'ArrowUp') {
			if (commandHistory.length === 0) return;
			e.preventDefault();
			historyIndex = Math.max(0, historyIndex - 1);
			terminalInput.textContent = commandHistory[historyIndex] || '';
			placeCaretAtEnd(terminalInput);
		} else if (e.key === 'ArrowDown') {
			if (commandHistory.length === 0) return;
			e.preventDefault();
			historyIndex = Math.min(commandHistory.length, historyIndex + 1);
			terminalInput.textContent = historyIndex === commandHistory.length ? '' : commandHistory[historyIndex];
			placeCaretAtEnd(terminalInput);
		}
	});

	function placeCaretAtEnd(el) {
		el.focus();
		if (typeof window.getSelection != "undefined"
			&& typeof document.createRange != "undefined") {
			const range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	updateCaretPos();
	placeCaretAtEnd(terminalInput);
});