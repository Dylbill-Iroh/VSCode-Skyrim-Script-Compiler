# skyrim-script-compiler README
Allows VS Code to compile script (.psc) files for skyrim LE and SE / AE. ﻿

## Features
- Compile script that's currently open, or all scripts in folder that current source script is in.
- Play custom sounds for compile success or failure.
- Auto detects which compilier to use based on where the source script is located.
- Option to auto compile .psc script when saving.
- Copy .pex and .psc files to set folder(s) when compiling.
- Print .psc data (Script, Function and Event Names) from base game for use with syntax highlighting.

## Commands 
Access commands by pressing ctrl + shift + p and search for Skyrim Script Compiler

- "Skyrim Script Compiler - print Psc Data" command will print native or global function and event names to output seperated by "|", from the last detected base game source scripts folder.

- This is to use for syntax highlighting. Specifically I use it with the Papyrus Code extension by Scrivener07.
Navigate to "C:\Users\YourUserName\.vscode\extensions\scrivener07.papyrus-1.0.0\syntaxes\papyrus\papyrus.json". 
There you can copy the Script Names to "class-types" and functions to "builtin-funcs" to include them with syntax highlighting.

- "Skyrim Script Compiler - Set Psc Output Folder(s) For Current Script"
- "Skyrim Script Compiler - Set Pex Output Folder(s) For Current Script"
- These commands allow you to set psc and pex output folder path(s) for the current open script. Meaning whenever you compile the script, if the script has psc or pex output folders set, the .psc and .pex files are copied to those folders. You can save the output folders for the specific script globally or to your workspace. If using multiple folder paths, they should be seprated by a semicolon ;

- "Skyrim Script Compiler - Copy psc and pex output folders from current script"
- "Skyrim Script Compiler - Paste psc and pex output folders to current script"
- Note when pasting, workspace state takes precedence. If output folders are present for workspace state, it pastes those, otherwise pastes from global state.

## How to use
To set which game version to compile from, first compile a script from the actual game folder's source scripts. E.G Skyrim/Scripts/Source, Skyrim Special Edition/Scripts/Source or Skyrim Special Edition/Source/Scripts. This will set the compiler, flags and source folder the extension uses. After, you can compile a .psc script from anywhere and this will use the last source, compiler and flags detected.

If compiling from an external folder, it uses the folder where the source script is located + the last detected base source folder as imports.

## Important info 
This extension assumes the compilier is in the default location: 
Skyrim\Papyrus Compiler\PapyrusCompiler.exe 
Skyrim Special Edition\Papyrus Compiler\PapyrusCompiler.exe

And that the flags (.flg) file is in the same location as the last base game source scripts folder detected:
Skyrim/Scripts/Source 
Skyrim Special Edition/Scripts/Source 
Skyrim Special Edition/Source/Scripts

## Extension Settings
fail or success sounds should be full path to sound. If no path is present, or the file doesn't exist, no sound is played.

**Enjoy!**
