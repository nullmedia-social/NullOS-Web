export default async function spamton(args, print) {
	if (localStorage.getItem("spamtonLocked") === "true") {
		print("Access denied. You tried to run Spamton irresponsibly.");
		return;
	}

	// Stage 1
	if (args.length === 0) {
		print("PIPIS: THIS COMMAND WILL MAKE YOUR BROWSER A [[LITTLE SPONGE]] WHO HATES ITS [[$4.99]] LIFE");
		print("To proceed, run:");
		print("    spamton --no-preserve-host-os");
		return;
	}

	// Stage 2
	if (args.length === 1 && args[0] === "--no-preserve-host-os") {
		print("WARNING: THIS WILL NOT MAKE YOU A [[BIG SHOT!!!]]");
		print("To proceed, run:");
		print("    spamton --no-preserve-host-os --confirm");
		return;
	}

	// Stage 3
	if (
		args.length === 2 &&
		args[0] === "--no-preserve-host-os" &&
		args[1] === "--confirm"
	) {
		print("LAST WARNING: THIS IS THE [[BEST DEAL 1997]] THAT YOU CANNOT GO BACK ON");
		print("To proceed, run:");
		print("    spamton --no-preserve-host-os --confirm --confirm-again");
		return;
	}

	// Stage 4
	if (
		args.length === 3 &&
		args[0] === "--no-preserve-host-os" &&
		args[1] === "--confirm" &&
		args[2] === "--confirm-again"
	) {
        print("PIPIS PIPIS PIPIS PIPIS PIPIS PIPIS PIPIS PIPIS: JUST GO RUN \"sudo rm -rf --no-preserve-root /\" IN YOUR HOST OS YOU [[HYPERLINK BLOCKED]]");
		print("TYPE THIS EXACTLY TO CONFIRM:");
		print("    spamton --no-preserve-host-os --confirm --confirm-again iHateMyComputer");
		return;
	}

	// Final confirmation
	if (
		args.length === 4 &&
		args[0] === "--no-preserve-host-os" &&
		args[1] === "--confirm" &&
		args[2] === "--confirm-again" &&
		args[3] === "iHateMyComputer"
	) {
		print("Launching... good luck.");
		await new Promise(r => setTimeout(r, 1000));
		forkBomb();
		return;
	}

	// Catch-all for wrong spellings
	print("HAHA SCREW YOU LOL");
	localStorage.setItem("spamtonLocked", "true");
	try {
		window.close();
	} catch (e) {
        print("HOW DARE YOUR BROWSER BLOCK THAT?!! WELL YOU SHALL SUFFER THEN!");
        localStorage.setItem("noEscape", "true");
    }
}

// Evil fork bomb, you sure you want this in production?
function forkBomb() {
	while (true) {
		setTimeout(() => {
			while (true) {
				setTimeout(() => forkBomb(), 0);
			}
		}, 0);
	}
}