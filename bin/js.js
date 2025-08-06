export default async function(args, outputLine) {
  const code = args.join(' ');
  if (!code) {
    outputLine('Usage: js <JavaScript code>');
    return;
  }

  try {
    const result = eval(code);
    if (result !== undefined) {
      outputLine(String(result));
    }
  } catch (e) {
    outputLine(`Error: ${e.message}`);
  }
}