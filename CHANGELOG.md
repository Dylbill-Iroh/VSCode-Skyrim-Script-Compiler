# Change Log

All notable changes to the "skyrim-script-compiler" extension will be documented in this file.

## [Unreleased]

- Initial release

## [0.0.2] - 2023-08-24
### Added
- User defined pex and psc output folders can now have multiple folder path's seperated by a semicolon ;
- Added command: Skyrim Script Compiler - Add Current File Location to Pex Output Folders.
- Added command: Skyrim Script Compiler - Add Current File Location to Psc Output Folders.
- Added option to auto compile scripts when saving.

### Fixed
- Added extension active check for all functions.
- Updated README to reflect new features added.

## [0.0.3] - 2023-08-24
### Fixed
- Removed unnecessary notifications.

## [0.0.4] - 2023-08-28
### Added
- Added "Skyrim Script Compiler - print Psc Data" command.

### Fixed
- Removed yet another unnecessary notifications.

## [0.0.5] - 2023-08-29
### Changed
- print Psc Data command will now print all functions, events and scriptnames from directory current file is open in, if different than the base game source directory.

### Fixed
- Removed hopefully the last left over unnecessary debug notification.

## [0.0.6] - 2023-08-31
### Added
- Added commands:
- Set Psc Output Folder(s) For Current Script
- Set Pex Output Folder(s) For Current Script
- These commands allow you to set psc and pex output folder path(s) for the current open script. Meaning whenever you compile the script, if that script has psc or pex output folders set, the .psc and .pex files are copied to those folders. You can save the output folders for the specific script globally or to your workspace. If using multiple folder paths, they should be seprated by a semicolon ;

## [0.0.7] - 2023-09-01
### Added
- Added commands:
- Copy psc and pex output folders from current script
- Paste psc and pex output folders to current script
- Note when pasting, workspace state takes precedence. If output folders are present for workspace state, it pastes those, otherwise pastes from global state.

## [0.0.8] - 2024-06-13
### Added
- Added setting to clear output for Skyrim Script Compiler in the panel before compiling so it's always fresh.
- If not clearing output, puts in a dash line before the new output is generated. 
- Now always shows output after compiling a script.