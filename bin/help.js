export default function(args, outputLine) {
	outputLine(
`Available commands:

  alias [name="command"]       : create a new alias or list all current aliases
  cat [file path]              : print the contents of a file
  cd [directory]               : change the current working directory
  clear                        : clear all terminal output
  clearvfs                     : wipe the entire virtual file system from localStorage
  cp [src] [dest]              : copy a file or directory
  diff [file1] [file2]         : compare two files line-by-line
  download [url] [dest]        : fetch a file from the internet and save it to the VFS
  echo [message]               : print a message to the terminal
  edit [file path]             : launch interactive file editor mode
  file [file path]             : print what type of file it is (text, dir, unknown)
  help                         : lists all available commands (you would know...right?)
  js [JavaScript code]         : run raw JavaScript (be careful)
  ls [directory]               : list the contents of a directory
  mkdir [directory]            : create a new directory
  mv [src] [dest]              : move or rename a file or directory
  nsh [script path]            : run a .nsh shell script
  npm [name]                   : install a script from the official NullOS repo into /bin
  reboot                       : reloads the page (reboots the system)
  rmdir [directory]            : delete an empty directory
  rm [file path]               : delete a file
  shutdown [ms]                : shutdown the system in ms milliseconds (or instantly if none given)
  spam [text|--real]           : spam text (or real spam images) forever until you press "c"
  [[REDACTED]]                 : [[REDACTED]]
  [[REDACTED]] [msg]           : make [[REDACTED]] say something (safely)
  tee [file path] [content]    : write text content to a file (overwrites it)
  touch [file path]            : create a new empty file if it doesn't already exist
  wc [file path]               : count lines, words, and bytes in a file
  which [command]              : show the full path to a command in /bin
`
	);
}