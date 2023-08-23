# skyrim-script-compiler README
Allows VS Code to compile script (.psc) files for skyrim LE and SE / AE. 

## Features
- Compile script that's currently open, or all scripts in folder that current source script is in.
- Play custom sounds for compile success or failure
- Auto detects which compilier to use based on where the source script is located

## Commands 
Access commands by pressing ctrl + shift + p and search for Skyrim Script Compiler - 

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
