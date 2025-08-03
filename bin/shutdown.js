export default function(args, outputLine) {
	outputLine("Shutting down...");
	setTimeout(() => window.close(), parseInt(args[0]) || 1);
}