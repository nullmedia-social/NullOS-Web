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

	const aliasMap = JSON.parse(localStorage.getItem('aliasMap') || '{}');
	function saveAliasMap() {
		localStorage.setItem('aliasMap', JSON.stringify(aliasMap));
	}

	function resolveAlias(cmdName) {
		return aliasMap[cmdName] || cmdName;
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
		const [rawCmdName, ...args] = cleanCmd.split(' ');
		const cmdName = resolveAlias(rawCmdName);

		commandHistory.push(cmd);
		historyIndex = commandHistory.length;

		const inputLine = document.createElement('div');
		inputLine.innerHTML = `<span class="prompt">root@nullos:${currentDir}$</span> ${cmd}`;
		output.appendChild(inputLine);

		try {
			// Try to import real command
			const module = await import(`./bin/${cmdName}.js`);
			if (typeof module.default === 'function') {
				await module.default(
					args,
					cmdOutput,
					virtualFS,
					saveVirtualFS,
					currentDir,
					setCurrentDir,
					setInputInterceptor,
					aliasMap,
					saveAliasMap
				);
			} else {
				cmdOutput(`Error: ${cmdName} is not executable`);
			}
		} catch (err) {
			// Try from virtualFS
			const possiblePaths = [
				`${currentDir}/${cmdName}`,
				`${currentDir}/${cmdName}.js`,
				`/bin/${cmdName}`,
				`/bin/${cmdName}.js`,
				`/${cmdName}`,
				`/${cmdName}.js`
			];

			let found = false;

			for (const key of possiblePaths) {
				if (virtualFS[key]) {
					found = true;
					try {
						const blob = new Blob([virtualFS[key]], { type: 'application/javascript' });
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
								setInputInterceptor,
								aliasMap,
								saveAliasMap
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

			if (!found) {
				cmdOutput(`Error: command not found: ${rawCmdName}`);
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
		if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
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