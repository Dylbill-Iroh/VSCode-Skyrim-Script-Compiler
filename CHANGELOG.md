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

## [0.0.4] - 2023-08-28
### Changed
- print Psc Data command will now print all functions, events and scriptnames from directory current file is open in, if different than the base game source directory.

### Fixed
- Removed hopefully the last left over unnecessary debug notification.