import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';

const skyrimSE = "Skyrim Special Edition";
const skyrim = "Skyrim";
var compilerOutput: vscode.OutputChannel;
var extensionActive:boolean = true;
var savedSkyrimRootPath:string = "";
var savedSkyrimSourcePath:string = "";
var currentContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionActive = true;
	console.log('"skyrim-script-compiler" is now active!');
	currentContext = context;

	if (compilerOutput === undefined){
		compilerOutput = vscode.window.createOutputChannel("Skyrim Script Compiler");
	}
	
	loadSkyrimPaths(currentContext);
//=============================================================================================================================================================
	let setpexOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.SetPexOutputFolder', async () => {
		let textEditor = vscode.window.activeTextEditor;

		if (textEditor !== undefined){
			//successNotification("output folder set");
			
			let fullFilePath = textEditor.document.fileName;
			let pexOutputFolder = path.dirname(fullFilePath);

			const result = await vscode.window.showInformationMessage("Set pex folder", 'Global', 'Workspace', 'WorkspaceFolder');
			
			let settingType = vscode.ConfigurationTarget.WorkspaceFolder;

			if (result === 'Global'){
				settingType = vscode.ConfigurationTarget.Global;
			} else if (result === 'Workspace'){
				settingType = vscode.ConfigurationTarget.Workspace;
			} else if (result === 'WorkspaceFolder'){
				settingType = vscode.ConfigurationTarget.WorkspaceFolder;
			} else {
				return;
			}

			let config = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler');

			try {
				config.update('OutputFolderPex', pexOutputFolder, settingType);
			} catch (e: any){
				errorNotification('failed to set pex folder path to ' + pexOutputFolder);
			} finally {
				successNotification("pex folder set");
				compilerOutput.appendLine('pex folder set to ' + pexOutputFolder);
				compilerOutput.show();
			}

		} else {
			errorNotification("No open file found. Open a file to set pex output folder to the file's location");
		}
	});

//=============================================================================================================================================================
	let setPscOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.SetPscOutputFolder', async () => {
		let textEditor = vscode.window.activeTextEditor;

		if (textEditor !== undefined){
			//successNotification("output folder set");
			
			let fullFilePath = textEditor.document.fileName;
			let outputFolder = path.dirname(fullFilePath);

			const result = await vscode.window.showInformationMessage("Set psc copy folder", 'Global', 'Workspace', 'WorkspaceFolder');
			
			let settingType = vscode.ConfigurationTarget.WorkspaceFolder;

			if (result === 'Global'){
				settingType = vscode.ConfigurationTarget.Global;
			} else if (result === 'Workspace'){
				settingType = vscode.ConfigurationTarget.Workspace;
			} else if (result === 'WorkspaceFolder'){
				settingType = vscode.ConfigurationTarget.WorkspaceFolder;
			} else {
				return;
			}

			let config = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler');

			try {
				config.update('OutputFolderPsc', outputFolder, settingType);
			} catch (e: any){
				errorNotification('failed to set psc folder path to ' + outputFolder);
			} finally {
				successNotification("psc folder set");
				compilerOutput.appendLine('psc folder set to ' + outputFolder);
				compilerOutput.show();
			}

		} else {
			errorNotification("No open file found. Open a file to set psc copy folder to the file's location");
		}
	});

//=============================================================================================================================================================
	let compileScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.CompileScript', () => {
		if (!extensionActive){
			return;
		}

		if (savedSkyrimRootPath === "" || savedSkyrimSourcePath === ""){
			loadSkyrimPaths(currentContext);
		}

		let textEditor = vscode.window.activeTextEditor;
		if (textEditor !== undefined){
			let fullFilePath = textEditor.document.fileName;
			let ext = path.extname(fullFilePath);
			
			if (ext === ".psc"){
				let pexOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPex;
				let outputToSkyrimScriptsFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').AlwaysOutputToSkyrimScriptsFolder;
				
				let sDir = path.dirname(fullFilePath);
				let importPaths = sDir;
				let skyrimRootPath = "";
				let compilerPath = "";
				let flagsPath = "";
				let scriptsPath = pexOutputFolder;

				let versionIndex = fullFilePath.lastIndexOf(skyrimSE);
				
				if (versionIndex !== -1){
					versionIndex += skyrimSE.length;
				} else {
					versionIndex = fullFilePath.lastIndexOf(skyrim);
					if  (versionIndex !== -1){
						versionIndex += skyrim.length;
					}
				}

				let rootFound:boolean = false;

				if (versionIndex !== -1){
					skyrimRootPath = fullFilePath.slice(0, versionIndex);
					compilerPath = skyrimRootPath + "\\Papyrus Compiler\\PapyrusCompiler.exe";
					if (fs.existsSync(compilerPath)) {
						// File exists in path
						rootFound = true;

						if (savedSkyrimRootPath !== skyrimRootPath || savedSkyrimSourcePath !== sDir){
							savedSkyrimRootPath = skyrimRootPath;
							savedSkyrimSourcePath = sDir;
							saveSkyrimPaths(currentContext);
						}
						
						if (scriptsPath === "" || scriptsPath === undefined || outputToSkyrimScriptsFolder){
							scriptsPath = skyrimRootPath + "\\Data\\Scripts";
						}

						flagsPath = sDir + "\\TESV_Papyrus_Flags.flg";
					}
				} 
				
				if (!rootFound || versionIndex === -1){
					if (savedSkyrimRootPath !== "" && savedSkyrimRootPath !== undefined){
						compilerPath = savedSkyrimRootPath + "\\Papyrus Compiler\\PapyrusCompiler.exe";
						
						if (scriptsPath === "" || scriptsPath === undefined || outputToSkyrimScriptsFolder){
							scriptsPath = savedSkyrimRootPath + "\\Data\\Scripts";
						}
	
						flagsPath = savedSkyrimSourcePath + "\\TESV_Papyrus_Flags.flg";
						importPaths = (savedSkyrimSourcePath + ";" + sDir);
					}
				}
				
				let canContinue:boolean = true;

				if (compilerPath === "" || compilerPath === undefined){
					canContinue = false;
				}
				else if (!fs.existsSync(compilerPath)) {
					canContinue = false;
				}

				if (canContinue) {
					let compileCommand = "\"" + compilerPath + "\" \"" + fullFilePath + "\" \"-output=" + scriptsPath + "\" \"-import=" + importPaths + "\" \"-flags=" + flagsPath + "\"";

					cp.exec(compileCommand, (err, stdout, stderr) => {
						let msg = stdout;
						compilerOutput.appendLine(msg);

						if (stderr !== ""){
							errorNotification(stderr);
						} else {
							successNotification(path.basename(fullFilePath) + ' compiled succesfully');
							
							if (scriptsPath !== pexOutputFolder && pexOutputFolder !== "" && pexOutputFolder !== undefined){
								let pexName = path.basename(fullFilePath);
								pexName = pexName.slice(0, pexName.length - 4) + ".pex";
								let destinationPath = pexOutputFolder + "\\" + pexName;
								let copyPath = scriptsPath + "\\" + pexName;
								//vscode.window.showInformationMessage('pexName = ' + pexName);
								fs.copyFile(copyPath, destinationPath, (err) => {
									if (err){
										errorNotification('failed to copy ' + copyPath + ' to ' + destinationPath);
									} 
								});
							}

							let pscOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPsc;
							if (pscOutputFolder !== undefined && pscOutputFolder !== "" && pscOutputFolder !== sDir){
								let pscName = path.basename(fullFilePath);
								let destinationPath = pscOutputFolder + "\\" + pscName;
								//vscode.window.showInformationMessage('pexName = ' + pexName);
								fs.copyFile(fullFilePath, destinationPath, (err) => {
									if (err){
										errorNotification('failed to copy ' + fullFilePath + ' to ' + destinationPath);
									} 
								});
							}
						}
					});
				} else {
					errorNotification('Skyrim root folder not found. Compile a script from data/scripts/source or data/source/scripts first before compiling from an external folder.');
				}
			} else {
				errorNotification(path.basename(fullFilePath) + ' is not a papyrus (.psc) script.');
			}
			//vscode.window.showInformationMessage('file path = ' + fullFilePath + " sDir = " + sDir);
		}
	});
	
//=============================================================================================================================================================
	let compileAllScriptsFunction = vscode.commands.registerCommand('skyrim-script-compiler.CompileAllScripts', async () => {
		if (!extensionActive){
			return;
		}
		if (savedSkyrimRootPath === "" || savedSkyrimSourcePath === ""){
			loadSkyrimPaths(currentContext);
		}

		let textEditor = vscode.window.activeTextEditor;
		if (textEditor !== undefined){
			let fullFilePath = textEditor.document.fileName;
			let ext = path.extname(fullFilePath);
			
			if (ext === ".psc"){
				let pexOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPex;
				let outputToSkyrimScriptsFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').AlwaysOutputToSkyrimScriptsFolder;
				let sDir = path.dirname(fullFilePath);
				let importPaths = sDir;
				let skyrimRootPath = "";
				let compilerPath = "";
				let flagsPath = "";
				let scriptsPath = pexOutputFolder;

				let versionIndex = fullFilePath.lastIndexOf(skyrimSE);
				
				if (versionIndex !== -1){
					versionIndex += skyrimSE.length;
				} else {
					versionIndex = fullFilePath.lastIndexOf(skyrim);
					if  (versionIndex !== -1){
						versionIndex += skyrim.length;
					}
				}

				let rootFound:boolean = false;

				if (versionIndex !== -1){
					skyrimRootPath = fullFilePath.slice(0, versionIndex);
					compilerPath = skyrimRootPath + "\\Papyrus Compiler\\PapyrusCompiler.exe";
					if (fs.existsSync(compilerPath)) {
						// File exists in path
						rootFound = true;
						if (savedSkyrimRootPath !== skyrimRootPath || savedSkyrimSourcePath !== sDir){
							savedSkyrimRootPath = skyrimRootPath;
							savedSkyrimSourcePath = sDir;
							saveSkyrimPaths(currentContext);
						}

						if (scriptsPath === "" || outputToSkyrimScriptsFolder){
							scriptsPath = skyrimRootPath + "\\Data\\Scripts";
						}

						flagsPath = sDir + "\\TESV_Papyrus_Flags.flg";
					}
				} 
				
				if (!rootFound || versionIndex === -1){
					if (savedSkyrimRootPath !== ""){
						compilerPath = savedSkyrimRootPath + "\\Papyrus Compiler\\PapyrusCompiler.exe";
	
						if (scriptsPath === "" || outputToSkyrimScriptsFolder){
							scriptsPath = savedSkyrimRootPath + "\\Data\\Scripts";
						}
	
						flagsPath = savedSkyrimSourcePath + "\\TESV_Papyrus_Flags.flg";
						importPaths = (savedSkyrimSourcePath + ";" + sDir);
					}
				}
				
				let canContinue:boolean = true;

				if (compilerPath === ""){
					canContinue = false;
				}
				else if (!fs.existsSync(compilerPath)) {
					canContinue = false;
				}

				if (canContinue) {
					let compileCommand = "\"" + compilerPath + "\" \"" + sDir + "\"" + ' -all ' + " \"-output=" + scriptsPath + "\" \"-import=" + importPaths + "\" \"-flags=" + flagsPath + "\"";

					cp.exec(compileCommand, (err, stdout, stderr) => {
						let msg = stdout;
						compilerOutput.appendLine(msg);

						if (stderr !== ""){
							errorNotification(stderr);
						} else {
							successNotification(path.basename(fullFilePath) + ' compiled succesfully');
							
							let hadAnErr:boolean = false;
							if (scriptsPath !== pexOutputFolder && pexOutputFolder !== "" && pexOutputFolder !== undefined){
								var s:string = "";
								
								fs.readdirSync(sDir).forEach(file => {
									let extt = path.extname(file);
									if (extt === ".psc"){
										let pexName = path.basename(file);
										pexName = pexName.slice(0, pexName.length - 4) + ".pex";
										let destinationPath = pexOutputFolder + "\\" + pexName;
										let copyPath = scriptsPath + "\\" + pexName;
										//vscode.window.showInformationMessage('pexName = ' + pexName);
										fs.copyFile(copyPath, destinationPath, (err) => {
											if (err){
												hadAnErr = true;
												compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
											} 
										});
										//compilerOutput.appendLine(file);
									}
								});
								if (hadAnErr){
									compilerOutput.show();
								}
							}

							let pscOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPsc;
							if (pscOutputFolder !== undefined && pscOutputFolder !== "" && pscOutputFolder !== sDir){
								fs.readdirSync(sDir).forEach(file => {
									let extt = path.extname(file);
									if (extt === ".psc"){
										let pscName = path.basename(file);
										let destinationPath = pscOutputFolder + "\\" + pscName;
										let copyPath = sDir + "\\" + pscName;
										//vscode.window.showInformationMessage('pexName = ' + pexName);
										fs.copyFile(copyPath, destinationPath, (err) => {
											if (err){
												hadAnErr = true;
												compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
											} 
										});
										//compilerOutput.appendLine(file);
									}
								});
								if (hadAnErr){
									compilerOutput.show();
								}
							}
						}
					});
				} else {
					errorNotification('Skyrim root folder not found. Compile a script from data/scripts/source or data/source/scripts first before compiling from an external folder.');
				}
			} else {
				errorNotification(path.basename(fullFilePath) + ' is not a papyrus (.psc) script.');
			}
			//vscode.window.showInformationMessage('file path = ' + fullFilePath + " sDir = " + sDir);
		}
	});

	context.subscriptions.push(setpexOutputFolderFunction);
	context.subscriptions.push(setPscOutputFolderFunction);
	context.subscriptions.push(compileScriptFunction);
	context.subscriptions.push(compileAllScriptsFunction);
}

export function deactivate() {
	extensionActive = false;
}

export function saveSkyrimPaths(context: vscode.ExtensionContext){
	let saveGlobal = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').GloballySaveSkyrimRootPath;
	
	if (saveGlobal){
		//compilerOutput.appendLine('save Global');
		context.globalState.update('savedSkyrimRootPath', savedSkyrimRootPath);
		context.globalState.update('savedSkyrimSourcePath', savedSkyrimSourcePath);
	} else {
		//compilerOutput.appendLine('save Workspace');
		context.workspaceState.update('savedSkyrimRootPath', savedSkyrimRootPath);
		context.workspaceState.update('savedSkyrimSourcePath', savedSkyrimSourcePath);
	}
	compilerOutput.appendLine('Skyrim source path changed to ' + savedSkyrimSourcePath);
	compilerOutput.show();
}

export function loadSkyrimPaths(context: vscode.ExtensionContext){
	let loadGlobal = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').GloballySaveSkyrimRootPath;
	//compilerOutput.appendLine('loadGlobal = ' + loadGlobal);

	if (loadGlobal){
		let aksavedSkyrimRootPath = context.globalState.get<string>('savedSkyrimRootPath');
		let aksavedSkyrimSourcePath = context.globalState.get<string>('savedSkyrimSourcePath');

		if (aksavedSkyrimRootPath !== undefined){
			savedSkyrimRootPath = aksavedSkyrimRootPath;
			//compilerOutput.appendLine('Skyrim root path loaded: ' + savedSkyrimRootPath);
		} /* else {
			compilerOutput.appendLine('load global savedSkyrimRootPath failed to load');
		} */

		if (aksavedSkyrimSourcePath !== undefined){
			savedSkyrimSourcePath = aksavedSkyrimSourcePath;
			compilerOutput.appendLine('Skyrim source path loaded: ' + savedSkyrimSourcePath);
		} /* else {
			compilerOutput.appendLine('load global savedSkyrimSourcePath failed to load');
		} */
		//compilerOutput.show();

	} else {
		let aksavedSkyrimRootPath = context.workspaceState.get<string>('savedSkyrimRootPath');
		let aksavedSkyrimSourcePath = context.workspaceState.get<string>('savedSkyrimSourcePath');

		if (aksavedSkyrimRootPath !== undefined){
			savedSkyrimRootPath = aksavedSkyrimRootPath;
			//compilerOutput.appendLine('Skyrim root path loaded: ' + savedSkyrimRootPath);
		} /* else {
			compilerOutput.appendLine('load workspace savedSkyrimRootPath failed to load');
		} */

		if (aksavedSkyrimSourcePath !== undefined){
			savedSkyrimSourcePath = aksavedSkyrimSourcePath;
			compilerOutput.appendLine('Skyrim source path loaded: ' + savedSkyrimSourcePath);
		} /* else {
			compilerOutput.appendLine('load workspace savedSkyrimSourcePath failed to load');
		} */
		//compilerOutput.show();
	}
	
	//compilerOutput.show();
}

export async function showNotification(message: String, timeout: number = 5500) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        },
        async (progress) => {
            progress.report({ increment: 100, message: `${message}` });
            await new Promise((resolve) => setTimeout(resolve, timeout));
        }
    );
}

export function errorNotification(message: string){
	compilerOutput.appendLine(message);
	const soundPath = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').SoundFilePathFail;
	if (soundPath !== undefined && soundPath !== ""){
		if (fs.existsSync(soundPath)){
			let soundCommand = "powershell -c (New-Object Media.SoundPlayer '" + soundPath + "').PlaySync();";
			cp.exec(soundCommand);
		}
	}
	compilerOutput.show();
}
export function successNotification(message: string){
	const soundPath = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').SoundFilePathSuccess;
	let playedSound:boolean = false;

	if (soundPath !== undefined && soundPath !== ""){
		if (fs.existsSync(soundPath)){
			playedSound = true;
			let soundCommand = "powershell -c (New-Object Media.SoundPlayer '" + soundPath + "').PlaySync();";
			cp.exec(soundCommand, (err, stdout, stderr) => {
				if (stderr !== ""){ //failed to play sound
					showNotification(message);
				}
			});
		}
	}
	if (!playedSound){
		showNotification(message);
	}
}