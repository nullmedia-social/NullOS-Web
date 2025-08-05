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
			// Try to import command module from /bin/
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
			// If import failed, check if virtualFS has the command as code string
			if (virtualFS[cmdName]) {
				try {
					// Evaluate the virtualFS command code as a module function
					// Expect the code string in virtualFS[cmdName] to export default async function(args, outputLine, virtualFS, saveVirtualFS, currentDir, setCurrentDir, setInputInterceptor)
					const code = virtualFS[cmdName];
					// Wrap code as module, eval it, then run default export function
					const moduleFunc = new Function('exports', 'module', code + '\nreturn module.exports.default;');
					const exports = {};
					const moduleObj = { exports };
					const commandFunc = moduleFunc(exports, moduleObj);
					if (typeof commandFunc === 'function') {
						await commandFunc(
							args,
							cmdOutput,
							virtualFS,
							saveVirtualFS,
							currentDir,
							setCurrentDir,
							setInputInterceptor
						);
					} else {
						cmdOutput(`Error: virtual command '${cmdName}' is not executable`);
					}
				} catch (e) {
					cmdOutput(`Error executing virtual command '${cmdName}': ${e.message}`);
				}
			} else {
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