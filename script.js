document.addEventListener('DOMContentLoaded', () => {
	const terminalInput = document.getElementById('terminalInput');
	const output = document.getElementById('output');

	let commandHistory = [];
	let historyIndex = -1;

	// Load virtualFS from localStorage or start empty
	const virtualFS = JSON.parse(localStorage.getItem('virtualFS') || '{}');
	function saveVirtualFS() {
		localStorage.setItem('virtualFS', JSON.stringify(virtualFS));
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

		// Show input line
		const inputLine = document.createElement('div');
		inputLine.textContent = `root@nullos:/$ ${cmd}`;
		output.appendChild(inputLine);

		// Try to load and run command module, pass virtualFS and saveVirtualFS
		try {
			const module = await import(`./bin/${cmdName}.js`);
			if (typeof module.default === 'function') {
				await module.default(args, cmdOutput, virtualFS, saveVirtualFS);
			} else {
				cmdOutput(`Error: ${cmdName} is not executable`);
			}
		} catch (err) {
			cmdOutput(`Error: command not found: ${cmdName}`);
		}

		terminalInput.textContent = '';
		updateCaretPos();
	}

	terminalInput.addEventListener('input', updateCaretPos);
	terminalInput.addEventListener('click', updateCaretPos);
	terminalInput.addEventListener('keyup', (e) => {
		updateCaretPos();

		if (e.key === 'Enter') {
			e.preventDefault();
			runCmd(terminalInput.textContent);
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