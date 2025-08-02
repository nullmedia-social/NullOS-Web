document.addEventListener('DOMContentLoaded', () => {
	const terminalInput = document.getElementById('terminalInput');
	const output = document.getElementById('output');

	let commandHistory = [];
	let historyIndex = -1;

	function updateCaretPos() {
		const sel = window.getSelection();
		if (!sel.rangeCount) return;

		const range = sel.getRangeAt(0);
		const pos = range.startOffset;

		terminalInput.style.setProperty('--caret-pos', pos);
	}

	function runCmd(cmd) {
		if (!cmd.trim()) return;

		function cmdOutput(text) {
			const line = document.createElement('div');
			line.textContent = text;
			output.appendChild(line);
		}

		const cleanCmd = cmd.trim();

		// Save to history
		commandHistory.push(cmd);
		historyIndex = commandHistory.length;

		// Run supported commands
		if (cleanCmd === 'clear') {
			output.innerHTML = '';
		} else if (cleanCmd === 'help') {
			cmdOutput('Available commands:\n    clear: clears the terminal history\n    help: lists available commands\n    echo [text]: prints text\n    reboot: reloads the OS\n    shutdown [ms]: closes the OS (or tries to)');
		} else if (cleanCmd.startsWith('echo ')) {
			cmdOutput(cleanCmd.slice(5));
		} else if (cleanCmd === 'reboot') {
			window.location.reload();
		} else if (cleanCmd === 'whoami') {
			cmdOutput('You are root');
		} else if (cleanCmd.startsWith('shutdown')) {
			const delayStr = cleanCmd.slice(8).trim();
			const delay = parseInt(delayStr, 10);
			cmdOutput('Shutting down...');
			setTimeout(() => {
				window.close(); // will only work in allowed contexts (like popup tabs)
			}, isNaN(delay) ? 1 : delay);
		} else {
			// Unknown command output
			const line = document.createElement('div');
			line.textContent = `root@nullos:/$ ${cmd}`;
			output.appendChild(line);

			const err = document.createElement('div');
			err.textContent = `Error: command not found: ${cmd}`;
			output.appendChild(err);
		}

		// Clear input
		terminalInput.textContent = '';
		updateCaretPos();
	}

	terminalInput.addEventListener('input', updateCaretPos);
	terminalInput.addEventListener('click', updateCaretPos);
	terminalInput.addEventListener('keyup', (e) => {
		updateCaretPos();

		if (e.key === 'Enter') {
			e.preventDefault(); // prevent newline
			runCmd(terminalInput.textContent);
		} else if (e.key === 'ArrowUp') {
			if (commandHistory.length === 0) return;
			e.preventDefault();
			historyIndex = Math.max(0, historyIndex - 1);
			terminalInput.textContent = commandHistory[historyIndex] || '';
			placeCaretAtEnd(terminalInput);
			updateCaretPos();
		} else if (e.key === 'ArrowDown') {
			if (commandHistory.length === 0) return;
			e.preventDefault();
			historyIndex = Math.min(commandHistory.length, historyIndex + 1);
			if (historyIndex === commandHistory.length) {
				terminalInput.textContent = '';
			} else {
				terminalInput.textContent = commandHistory[historyIndex] || '';
			}
			placeCaretAtEnd(terminalInput);
			updateCaretPos();
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