export default function(args, outputLine) {
	outputLine(
`Available commands:
    alias [name="command"]       : create or list aliases
    cat [file path]              : read the contents of a file
    cd [directory]               : change current directory
    clear                       : clear terminal history
    clearvfs                    : clear virtual file system stored in localStorage
    cp [src] [dest]              : copy file or directory
    diff [file1] [file2]         : compare two files line-by-line
    download [file path]         : download a file
    echo [message]               : output the message
    edit [file path]             : open file in editor
    file [file path]             : determine file type
    help                        : lists available commands (you would know...right?)
    js [JavaScript code]         : execute JavaScript code
    ls [directory]               : list files in directory
    mkdir [directory]            : make a new directory
    mv [src] [dest]              : move or rename file/directory
    nsh [script path]            : run nsh script file
    reboot                      : reboot the system
    rmalias [name]               : remove an alias
    rmdir [directory]            : remove an empty directory
    rm [file path]               : remove a file
    shutdown [ms]                : shutdown system after ms milliseconds
    spam                        : spams text continuously, cancel with c
    tee [file path] [content]    : write content to file
    touch [file path]            : create an empty file
    wc [file path]               : count lines, words, bytes in a file
    which [command]              : show path of command
`
	);
}