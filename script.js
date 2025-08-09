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

	const envVars = {}; // In-memory environment variables (reset on reload)

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

	// Expand $VAR and $(cmd) substitutions (simple)
	async function expandVariablesAndSubstitutions(input) {
		// Expand $VAR variables
		input = input.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, v) => {
			return envVars[v] !== undefined ? envVars[v] : '';
		});

		// Helper: run a command and capture its output text as a string
		async function runCommandCaptureOutput(cmdString) {
			let outputText = '';
			function captureOutput(text) {
				outputText += text + '\n';
			}
			// Run command, await completion
			await runCmdCapture(cmdString, captureOutput);
			return outputText.trim();
		}

		// RunCmd that uses the above captureOutput, only for internal use here:
		async function runCmdCapture(cmd, captureOutputFn) {
			cmd = cmd.trim();
			if (!cmd) return;
			if (cmd.startsWith('#')) return; // comment

			// For simplicity, no alias resolving or variable expanding inside $(...) to avoid recursion nightmare
			const tokens = splitArgs(cmd);
			const cmdName = tokens[0];
			const args = tokens.slice(1);

			try {
				const module = await import(`./bin/${cmdName}.js`);
				if (typeof module.default === 'function') {
					await module.default(args, captureOutputFn, virtualFS, saveVirtualFS, currentDir, setCurrentDir, setInputInterceptor, aliasMap, saveAliasMap, envVars);
				}
			} catch {
				// silently ignore errors in command substitution
			}
		}

		// Now expand all $(...) occurrences with their command output, await all
		const regex = /\$\(([^)]+)\)/g;

		let match;
		let lastIndex = 0;
		let result = '';

		while ((match = regex.exec(input)) !== null) {
			result += input.slice(lastIndex, match.index);
			const cmdInside = match[1];
			const output = await runCommandCaptureOutput(cmdInside);
			result += output;
			lastIndex = regex.lastIndex;
		}
		result += input.slice(lastIndex);

		return result;
	}
	
	async function runCmd(cmd) {
		cmd = cmd.trim();
		if (!cmd) return;
		if (cmd.startsWith('#')) return; // comment line

		function outputLine(text) {
			const line = document.createElement('div');
			line.textContent = text;
			output.appendChild(line);
		}

		// Check inline variable assignment: $VAR="value" or $VAR='value' or $VAR=value
		const varAssignRegex = /^\$([a-zA-Z_][a-zA-Z0-9_]*)=(["']?)(.*?)\2$/;
		const varMatch = cmd.match(varAssignRegex);
		if (varMatch) {
			const varName = varMatch[1];
			const varValue = varMatch[3];
			envVars[varName] = varValue;
			outputLine(`Variable ${varName} set to '${varValue}'`);
			return;
		}

		// Expand variables and substitutions
		cmd = await expandVariablesAndSubstitutions(cmd);

		const cleanCmd = cmd;
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
					outputLine,
					virtualFS,
					saveVirtualFS,
					currentDir,
					setCurrentDir,
					setInputInterceptor,
					aliasMap,
					saveAliasMap,
					envVars
				);
			} else {
				outputLine(`Error: ${cmdName} is not executable`);
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
								outputLine,
								virtualFS,
								saveVirtualFS,
								currentDir,
								setCurrentDir,
								setInputInterceptor,
								aliasMap,
								saveAliasMap,
								envVars
							);
						} else {
							outputLine(`Error: ${cmdName} (virtual) is not executable`);
						}
						URL.revokeObjectURL(url);
					} catch (virtualErr) {
						outputLine(`Error running virtual command: ${virtualErr.message}`);
					}
					break;
				}
			}

			if (!found) {
				outputLine(`Error: command not found: ${cmdName}`);
			}
		}

		prompt.textContent = `root@nullos:${currentDir}$`;
		terminalInput.textContent = '';
		updateCaretPos();
		window.scrollTo(0, document.body.scrollHeight);
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