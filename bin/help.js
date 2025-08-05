export default function(args, outputLine) {
	outputLine(
`Available commands:
    echo [message]: repeats the message
    help: lists available commands (you would know...right?)
    clear: clears the terminal history
    clearvfs: clears the virtual file system stored in localStorage
    cat [file path]: reads the file specified
    reboot: reboots the system
    shutdown [ms]: shuts down the system in the specified time
    ls [dir]: lists files in the specified directory
    cd [dir]: changes the current directory to the specified one
    edit [file path]: opens the specified file in the editor
    rm [file path]: deletes the specified file
    tee [file path] [file content]: writes the content to the specified file`
	);
}