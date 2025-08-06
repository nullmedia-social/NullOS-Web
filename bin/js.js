export default async function(args, outputLine) {
  const code = args.join(' ');
  if (!code) {
    outputLine('Usage: js <JavaScript code>');
    return;
  }

  try {
    // Use Function constructor instead of eval for slightly safer sandboxing
    const func = new Function(`return (${code})`);
    const result = func();
    outputLine(String(result));
  } catch (e) {
    outputLine(`Error: ${e.message}`);
  }
}