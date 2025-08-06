document.addEventListener('DOMContentLoaded', () => {
	const prompt = document.querySelector('.prompt');
	let currentDir = '/';
	const terminalInput = document.getElementById('terminalInput');
	const output = document.getElementById('output');

	if (localStorage.getItem('noEscape') === 'true') {
		window.onclose = () => {
			alert("You cannot close this window! You are trapped in NullOS!");
			window.open("./nullos.html");
			return false;
		};
	}

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

	function resolveAlias(tokens) {
		if (tokens.length === 0) return tokens;
		const [first, ...rest] = tokens;
		if (aliasMap[first]) {
			return [...aliasMap[first], ...rest];
		}
		return tokens;
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

	// ✨ NEW: Argument splitter with quote support
	function splitArgs(input) {
		const args = [];
		let current = '';
		let inQuotes = false;
		let quoteChar = '';

		for (let i = 0; i < input.length; i++) {
			const char = input[i];

			if ((char === '"' || char === "'") && !inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar && inQuotes) {
				inQuotes = false;
				quoteChar = '';
			} else if (char === ' ' && !inQuotes) {
				if (current.length > 0) {
					args.push(current);
					current = '';
				}
			} else {
				current += char;
			}
		}
		if (current.length > 0) {
			args.push(current);
		}
		return args;
	}

	async function runCmd(cmd) {
		if (!cmd.trim()) return;
		if (cmd.trim().startsWith('#')) return;

		function cmdOutput(text) {
			const line = document.createElement('div');
			line.textContent = text;
			output.appendChild(line);
		}

		const cleanCmd = cmd.trim();
		let inputTokens = splitArgs(cleanCmd);
		let cmdName = inputTokens[0];
		let args;

		if (cmdName === 'js') {
			// For js command, take everything after 'js' as one argument (raw code string)
			const codeStartIndex = cleanCmd.indexOf(' ') + 1;
			const codeString = codeStartIndex > 0 ? cleanCmd.slice(codeStartIndex).trim() : '';
			args = [codeString];
		} else {
			// Otherwise normal splitting + alias resolving
			const resolvedTokens = resolveAlias(inputTokens);
			cmdName = resolvedTokens[0];
			args = resolvedTokens.slice(1);
		}

		commandHistory.push(cmd);
		historyIndex = commandHistory.length;

		const inputLine = document.createElement('div');
		inputLine.innerHTML = `<span class="prompt">root@nullos:${currentDir}$</span> ${cmd}`;
		output.appendChild(inputLine);

		try {
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