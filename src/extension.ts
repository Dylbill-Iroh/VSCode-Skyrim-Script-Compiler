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
	
    compilerOutput.appendLine('"skyrim-script-compiler" is now active!');

	loadSkyrimPaths(currentContext);
	
    let setPscOutputFoldersForScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.setPscOutputFoldersForScript', async () => {
		setPscOutputFoldersForScript();
	});

    let setpexOutputFoldersForScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.setpexOutputFoldersForScript', async () => {
		setpexOutputFoldersForScript();
	});

    let copyOutputFoldersFromScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.copyOutputFoldersFromScript', async () => {
		copyOutputFoldersFromScript();
	});
    
    let pasteOutputFoldersToScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.pasteOutputFoldersToScript', async () => {
		pasteOutputFoldersToScript();
	});

    let pasteOutputFoldersToTabsFunction = vscode.commands.registerCommand('skyrim-script-compiler.pasteOutputFoldersToTabs', async () => {
		pasteOutputFoldersToTabs();
	}); 

	let setpexOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.SetPexOutputFolder', async () => {
		setpexOutputFolder();
	});

	let addToPexOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.addToPexOutputFolder', async () => {
		addToPexOutput();
	});

	let setPscOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.SetPscOutputFolder', async () => {
		setPscOutputFolder();
	});

	let addToPscOutputFolderFunction = vscode.commands.registerCommand('skyrim-script-compiler.AddToPscOutputFolder', async () => {
		addToPscOutputFolder();
	});

	let compileScriptFunction = vscode.commands.registerCommand('skyrim-script-compiler.CompileScript', () => {
		compileCurrentScript();
	});

	let compileAllTabsFunction = vscode.commands.registerCommand('skyrim-script-compiler.CompileAllTabs', () => {
		compileAllTabs();
	});

	vscode.workspace.onDidSaveTextDocument((document) => {
		if (!extensionActive){
			return;
		}
		
		//showNotification(document.fileName + ' saved');

		let compileOnSave = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').CompileOnSave;
		if (compileOnSave){
			let ext = path.extname(document.fileName);
			if (ext === ".psc"){
				compileCurrentScript();
			}
		}
	});

//=============================================================================================================================================================
	let compileAllScriptsFunction = vscode.commands.registerCommand('skyrim-script-compiler.CompileAllScripts', async () => {
		compileAllScripts();
	});

    let printPscTODOHighlightsFunction = vscode.commands.registerCommand('skyrim-script-compiler.printPscData', async () => {
		printPscData();
	});
    
	context.subscriptions.push(setPscOutputFoldersForScriptFunction);
	context.subscriptions.push(setpexOutputFoldersForScriptFunction);
	context.subscriptions.push(copyOutputFoldersFromScriptFunction);
	context.subscriptions.push(pasteOutputFoldersToScriptFunction);
	context.subscriptions.push(pasteOutputFoldersToTabsFunction);
	context.subscriptions.push(setpexOutputFolderFunction);
	context.subscriptions.push(addToPexOutputFolderFunction);
	context.subscriptions.push(setPscOutputFolderFunction);
	context.subscriptions.push(addToPscOutputFolderFunction);
	context.subscriptions.push(compileScriptFunction);
	context.subscriptions.push(compileAllTabsFunction);
	context.subscriptions.push(compileAllScriptsFunction);
	context.subscriptions.push(printPscTODOHighlightsFunction);
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

export function errorNotification(message: string, playSound:boolean = true){
	compilerOutput.appendLine(message);
    if (playSound){
        const soundPath = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').SoundFilePathFail;
        if (soundPath !== undefined && soundPath !== ""){
            if (fs.existsSync(soundPath)){
                let soundCommand = "powershell -c (New-Object Media.SoundPlayer '" + soundPath + "').PlaySync();";
                cp.exec(soundCommand);
            }
        }
    }
	compilerOutput.show();
}

export function successNotification(message: string, playSound:boolean = true, printToOutput:boolean = false){
	const soundPath = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').SoundFilePathSuccess;
	let playedSound:boolean = false;

    if (playSound){
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
    }

	if (!playedSound){
		showNotification(message);
	} 

    if (printToOutput === true){
        compilerOutput.appendLine(message);
        compilerOutput.show();
    }
}

export async function setpexOutputFolder(){
    if (!extensionActive){
        return;
    }

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
}

export async function setPscOutputFoldersForScript(){
    if (!extensionActive){
        return;
    }

    let textEditor = vscode.window.activeTextEditor;

    if (textEditor !== undefined){
        
        let fullFilePath = textEditor.document.fileName;
        let ext = path.extname(fullFilePath);

        if (ext !== ".psc"){
            errorNotification("current file is a " + ext + " file. Not a .psc file.");
            return;
        }

        let fileName = path.basename(fullFilePath);

        const contextState = await vscode.window.showInformationMessage("Set pex output folder(s) for " + fileName + " in", 'Global State', 'Workspace State');
        
        if (contextState === undefined){
            return;
        }

        let currentFolders = "";

        if (contextState === 'Global State'){ 
            let globalFolders = currentContext.globalState.get<string>(fileName);
            if (globalFolders !== undefined){
                currentFolders = globalFolders;
            }

        } else if (contextState === 'Workspace State'){
            let workspaceFolders = currentContext.workspaceState.get<string>(fileName);
            if (workspaceFolders !== undefined){
                currentFolders = workspaceFolders;
            }
        }

        vscode.window.showInputBox({
            prompt: "Enter pex output folder path(s) for " + fileName + ". Multiple folders should be seperated by a semicolon ;",
            value: currentFolders

        }).then(folders => {
            if (folders !== undefined && folders !== currentFolders) {
                if (contextState === 'Global State'){ 
                    currentContext.globalState.update(fileName, folders);
                } else if (contextState === 'Workspace State'){
                    currentContext.workspaceState.update(fileName, folders);
                }
                successNotification("output set");
                compilerOutput.appendLine("psc output folder(s) for " + fileName + " set to " + folders);
                compilerOutput.show();
            } 
        });

    } else {
        errorNotification("No open file found. Open a file to set pex output folder(s) for the file.");
    }
}

export async function setpexOutputFoldersForScript(){
    if (!extensionActive){
        return;
    }

    let textEditor = vscode.window.activeTextEditor;

    if (textEditor !== undefined){
        
        let fullFilePath = textEditor.document.fileName;
        let ext = path.extname(fullFilePath);

        if (ext !== ".psc"){
            errorNotification("current file is a " + ext + " file. Not a .psc file.");
            return;
        }

        let fileName = path.basename(fullFilePath);
		let pexName = fileName.slice(0, fileName.length - 4) + ".pex";

        const contextState = await vscode.window.showInformationMessage("Set pex output folder(s) for " + fileName + " in", 'Global State', 'Workspace State');
        
        if (contextState === undefined){
            return;
        }

        let currentFolders = "";

        if (contextState === 'Global State'){ 
            let globalFolders = currentContext.globalState.get<string>(pexName);
            if (globalFolders !== undefined){
                currentFolders = globalFolders;
            }

        } else if (contextState === 'Workspace State'){
            let workspaceFolders = currentContext.workspaceState.get<string>(pexName);
            if (workspaceFolders !== undefined){
                currentFolders = workspaceFolders;
            }
        }

        vscode.window.showInputBox({
            prompt: "Enter pex output folder path(s) for " + fileName + ". Multiple folders should be seperated by a semicolon ;",
            value: currentFolders

        }).then(folders => {
            if (folders !== undefined && folders !== currentFolders) {
                if (contextState === 'Global State'){ 
                    currentContext.globalState.update(pexName, folders);
                } else if (contextState === 'Workspace State'){
                    currentContext.workspaceState.update(pexName, folders);
                }
                successNotification("output set");
                compilerOutput.appendLine("pex output folder(s) for " + fileName + " set to " + folders);
                compilerOutput.show();
            } 
        });

    } else {
        errorNotification("No open file found. Open a file to set pex output folder(s) for the file.");
    }
}

export async function copyOutputFoldersFromScript(){
    if (!extensionActive){
        return;
    }

    let textEditor = vscode.window.activeTextEditor;

    if (textEditor !== undefined){
        
        let fullFilePath = textEditor.document.fileName;
        let ext = path.extname(fullFilePath);

        if (ext !== ".psc"){
            errorNotification("current file is a " + ext + " file. Not a .psc file.");
            return;
        }

        let pscName = path.basename(fullFilePath);
        currentContext.globalState.update("SkyrimScriptCompilier_CopiedPscScript", pscName);
        successNotification("Psc and Pex output folders copied from " + pscName);
        compilerOutput.appendLine("Psc and Pex output folders copied from " + pscName);
        compilerOutput.show();
    } else {
        errorNotification("No open file found. Open a file to set pex output folder(s) for the file.");
    }
}

export async function pasteOutputFoldersToScript(){
    if (!extensionActive){
        return;
    }

    let textEditor = vscode.window.activeTextEditor;

    if (textEditor !== undefined){
        
        let fullFilePath = textEditor.document.fileName;
        let ext = path.extname(fullFilePath);

        if (ext !== ".psc"){
            errorNotification("current file is a " + ext + " file. Not a .psc file.");
            return;
        }

        let pscName = path.basename(fullFilePath);
        let pexName = pscName.slice(0, pscName.length - 4) + ".pex";
        let atLeastOneFolderSet = false;
        let bGlobal = false;
        let savedPscName = currentContext.globalState.get<string>("SkyrimScriptCompilier_CopiedPscScript");

        if (savedPscName === undefined || savedPscName === ""){
            errorNotification("No output folders copied");
            return;
        }

        let savedPexName = savedPscName.slice(0, savedPscName.length - 4) + ".pex";

        let pscFolders = currentContext.workspaceState.get<string>(savedPscName);

        if (pscFolders === undefined){
            pscFolders = currentContext.globalState.get<string>(savedPscName);
            bGlobal = true;
        }

        if (pscFolders !== undefined && pscFolders !== ""){
            atLeastOneFolderSet = true;
            if (bGlobal){ 
                currentContext.globalState.update(pscName, pscFolders);
                compilerOutput.appendLine("Psc output folders for " + pscName + " set to " + pscFolders + " in the global state.");
            } else {
                currentContext.workspaceState.update(pscName, pscFolders);
                compilerOutput.appendLine("Psc output folders for " + pscName + " set to " + pscFolders + " in the workspace state.");
            }
        } 

        bGlobal = false;
        let pexFolders = currentContext.workspaceState.get<string>(savedPexName);

        if (pexFolders === undefined){
            pexFolders = currentContext.globalState.get<string>(savedPexName);
            bGlobal = true;
        }

        if (pexFolders !== undefined && pexFolders !== ""){
            atLeastOneFolderSet = true;
            if (bGlobal){ 
                currentContext.globalState.update(pexName, pexFolders);
                compilerOutput.appendLine("pex output folders for " + pscName + " set to " + pexFolders + " in the global state.");
            } else {
                currentContext.workspaceState.update(pexName, pexFolders);
                compilerOutput.appendLine("pex output folders for " + pscName + " set to " + pexFolders + " in the workspace state.");
            }
        } 

        if (atLeastOneFolderSet){
            successNotification("Output Folders Set for " + pscName);
            compilerOutput.show();
        } else {
            errorNotification("No output folders found for " + savedPscName);
        }
    } else {
        errorNotification("No open file found. Open a file to set psc and pex output folder(s) for the file.");
    }
}

export async function pasteOutputFoldersToTabs(){
    if (!extensionActive){
        return;
    }

    // let textEditor = vscode.window.activeTextEditor;
    let savedPscName = currentContext.globalState.get<string>("SkyrimScriptCompilier_CopiedPscScript");

    if (savedPscName === undefined || savedPscName === ""){
        errorNotification("No output folders copied");
        return;
    } 

    let bPscGlobal = false;
    let pscFolders = currentContext.workspaceState.get<string>(savedPscName);
    if (pscFolders === undefined){
        pscFolders = currentContext.globalState.get<string>(savedPscName);
        bPscGlobal = true;
    }

    let savedPexName = savedPscName.slice(0, savedPscName.length - 4) + ".pex";

    let bPexGlobal = false;
    let pexFolders = currentContext.workspaceState.get<string>(savedPexName);
    if (pexFolders === undefined){
        pexFolders = currentContext.globalState.get<string>(savedPexName);
        bPexGlobal = true;
    }

    let bPscFoldersFound = (pscFolders !== undefined && pscFolders !== "");
    let bPexFoldersFound = (pexFolders !== undefined && pexFolders !== "");

    if (!bPscFoldersFound && !bPexFoldersFound){
        errorNotification("Copied psc and pex output folders are empty.");
        return;
    }

    let pscPaths:string[] = getFilePathsOfOpenTabs(".psc");

    if (pscPaths.length > 0){
        for (const fullFilePath of pscPaths) {
            let ext = path.extname(fullFilePath);

            if (ext !== ".psc"){
                // errorNotification("current file is a " + ext + " file. Not a .psc file.");
                continue;
            }
    
            let pscName = path.basename(fullFilePath);
            let pexName = pscName.slice(0, pscName.length - 4) + ".pex";
    
            if (bPscFoldersFound){
                if (bPscGlobal){ 
                    currentContext.globalState.update(pscName, pscFolders);
                    compilerOutput.appendLine("Psc output folders for " + pscName + " set to " + pscFolders + " in the global state.");
                } else {
                    currentContext.workspaceState.update(pscName, pscFolders);
                    compilerOutput.appendLine("Psc output folders for " + pscName + " set to " + pscFolders + " in the workspace state.");
                }
            } 
    
            if (bPexFoldersFound){
                if (bPexGlobal){ 
                    currentContext.globalState.update(pexName, pexFolders);
                    compilerOutput.appendLine("pex output folders for " + pscName + " set to " + pexFolders + " in the global state.");
                } else {
                    currentContext.workspaceState.update(pexName, pexFolders);
                    compilerOutput.appendLine("pex output folders for " + pscName + " set to " + pexFolders + " in the workspace state.");
                }
            } 
    
            // if (atLeastOneFolderSet){
            //     successNotification("Output Folders Set for " + pscName);
            //     compilerOutput.show();
            // } else {
            //     errorNotification("No output folders found for " + savedPscName);
            // }
        }
        successNotification("Done pasting output folders.", true, true);
        compilerOutput.show();
    } else {
        errorNotification("No open .psc files found.");
    }
}

export async function addToPexOutput(){
    if (!extensionActive){
        return;
    }

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
        let outputFolderPex = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPex;
        
        if (outputFolderPex !== "" && outputFolderPex !== undefined){
            pexOutputFolder = outputFolderPex + ";" + pexOutputFolder;
        }

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
        errorNotification("No open file found. Open a file to add current file's location to the pex output folders.");
    }
}

export async function setPscOutputFolder(){
    if (!extensionActive){
        return;
    }

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
}

export async function addToPscOutputFolder(){
    if (!extensionActive){
        return;
    }

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
        let outputFolderPsc = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPsc;

        if (outputFolderPsc !== "" && outputFolderPsc !== undefined){
            outputFolder = outputFolderPsc + ";" + outputFolder;
        }

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
        errorNotification("No open file found. Open a file to add current file's location to psc output folders.");
    }
}

export function getSaveFoldersForScript(scriptName: string){
    
    let folders = currentContext.workspaceState.get<string>(scriptName);
    
    if (folders === undefined){
        folders = currentContext.globalState.get<string>(scriptName);
    }

    if (folders !== undefined){
        return folders;
    } else {
        return "";
    }
}

export function compileCurrentScript(){
	if (!extensionActive){
		return;
	}

	if (savedSkyrimRootPath === "" || savedSkyrimSourcePath === ""){
		loadSkyrimPaths(currentContext);
	}

	let textEditor = vscode.window.activeTextEditor;
	if (textEditor !== undefined){
		let fullFilePath = textEditor.document.fileName;
        let clearOutputBeforeCompiling = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').ClearOutputBeforeCompiling;
        compilePapyrusScript(fullFilePath, clearOutputBeforeCompiling);
        // compilerOutput.appendLine("fullFilePath = [" + fullFilePath + "]");
		
		//vscode.window.showInformationMessage('file path = ' + fullFilePath + " sDir = " + sDir);
	}
}

export async function compileAllTabs(){
    // compilerOutput.appendLine("compileAllTabs: extensionActive is " + extensionActive);

    let pscPaths:string[] = getFilePathsOfOpenTabs(".psc");

    if (pscPaths.length === 0){
        errorNotification("No open psc files found.");
    } else {
        let clearOutputBeforeCompiling = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').ClearOutputBeforeCompiling;
        if (clearOutputBeforeCompiling){
            compilerOutput.clear();
        } 

        let compileErrors:number = 0;

        for(const pscPath of pscPaths){
            let success = await compilePapyrusScript(pscPath, false, true);
            if (success === false){
                compileErrors++;
            }
            //delay for 0.25 seconds
            // await sleep(250);
        }

        if (compileErrors > 0){
            errorNotification(compileErrors + " out of " + pscPaths.length + " scripts failed to compile", false);
        } else {
            successNotification("compiled all " + pscPaths.length + " scripts successfully", false, true);
        }
    }
}

export async function compileAllScripts(){
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
            let clearOutputBeforeCompiling = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').ClearOutputBeforeCompiling;
			if (clearOutputBeforeCompiling === true){
                compilerOutput.clear();
            } else {
                compilerOutput.append("\n-----------------------------------------------------------------------\n\n");
            }

            let pexOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPex;
            let pexOutputFolders = pexOutputFolder.split(";");
            let outputToSkyrimScriptsFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').AlwaysOutputToSkyrimScriptsFolder;
            let sDir = path.dirname(fullFilePath);
            let importPaths = sDir;
            let skyrimRootPath = "";
            let compilerPath = "";
            let flagsPath = "";
            let scriptsPath = pexOutputFolders[0];

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
                if (savedSkyrimRootPath !== ""){
                    compilerPath = savedSkyrimRootPath + "\\Papyrus Compiler\\PapyrusCompiler.exe";

                    if (scriptsPath === "" || scriptsPath === undefined || outputToSkyrimScriptsFolder){
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
                        let m = pexOutputFolders.length;
                        for(let i = 0; i < m; i++){
                            if(pexOutputFolders[i] === scriptsPath){
                                pexOutputFolders.splice(i, 1);
                            }
                        }

                        let pscOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPsc;
                        let pscOutputFolders = [""];

                        if (pscOutputFolder !== undefined && pscOutputFolder !== ""){
                            pscOutputFolders = pscOutputFolder.split(";");

                            for(let i = 0; i < pscOutputFolders.length; i++){
                                if(pscOutputFolders[i] === sDir){
                                    pscOutputFolders.splice(i, 1);
                                }
                            }
                        }

                        fs.readdirSync(sDir).forEach(file => {
                            let extt = path.extname(file);
                            if (extt === ".psc"){
                                let pscName = path.basename(file);
                                let pexName = pscName.slice(0, pscName.length - 4) + ".pex";
                                let copyPath = scriptsPath + "\\" + pexName; //.pex

                                for(let i = 0; i < pexOutputFolders.length; i++){
                                    let destinationPath = pexOutputFolders[i] + "\\" + pexName;
                                    if (destinationPath !== "\\" + pexName){
                                        fs.copyFile(copyPath, destinationPath, (err) => {
                                            if (err){
                                                hadAnErr = true;
                                                compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
                                            } 
                                        });
                                    }
                                }
                                
                                let pexOutputFileFolders = getSaveFoldersForScript(pexName);

                                if (pexOutputFileFolders !== ""){
                                    let pexOutputFileFoldersArray = pexOutputFileFolders.split(";");

                                    for(let i = 0; i < pexOutputFileFoldersArray.length; i++){
                                        let destinationPath = pexOutputFileFoldersArray[i] + "\\" + pexName;

                                        if (destinationPath !== "\\" + pexName){
                                            fs.copyFile(copyPath, destinationPath, (err) => {
                                                if (err){
                                                    hadAnErr = true;
                                                    compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
                                                } 
                                            });
                                        }
                                    }
                                }

                                copyPath = sDir + "\\" + pscName;
                                for(let i = 0; i < pscOutputFolders.length; i++){
                                    let destinationPath = pscOutputFolders[i] + "\\" + pscName;
                                    if (destinationPath !== "\\" + pscName){
                                        fs.copyFile(copyPath, destinationPath, (err) => {
                                            if (err){
                                                hadAnErr = true;
                                                compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
                                            } 
                                        });
                                    }
                                }

                                let pscOutputFileFolders = getSaveFoldersForScript(pscName);

                                if (pscOutputFileFolders !== ""){
                                    let pscOutputFileFoldersArray = pscOutputFileFolders.split(";");

                                    for(let i = 0; i < pscOutputFileFoldersArray.length; i++){
                                        let destinationPath = pscOutputFileFoldersArray[i] + "\\" + pscName;
                                        if (destinationPath !== "\\" + pscName){
                                            fs.copyFile(copyPath, destinationPath, (err) => {
                                                if (err){
                                                    hadAnErr = true;
                                                    compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
                                                } 
                                            });
                                        }
                                    }
                                }
                            }
                        });
                        
                        if (hadAnErr){
                            errorNotification("copy error"); //play error sound if any
                        }
                    }
                    compilerOutput.show();
                });
            } else {
                errorNotification('Skyrim root folder not found. Compile a script from data/scripts/source or data/source/scripts first before compiling from an external folder.');
            }
        } else {
            errorNotification(path.basename(fullFilePath) + ' is not a papyrus (.psc) script.');
        }
        //vscode.window.showInformationMessage('file path = ' + fullFilePath + " sDir = " + sDir);
    }
}

export async function printPscData(){
    if (!extensionActive){
        return;
    }

    let scriptNames = "action|activator|activemagiceffect|actor|actorbase|actorvalue|alias|ammo|armor|associationtype|book|camerashot|cell|class|combatstyle|commonarrayfunctions|component|constructibleobject|container|debug|door|effectshader|enchantment|encounterzone|explosion|faction|flora|form|formlist|furniture|game|globalvariable|hazard|headpart|holotape|idle|idlemarker|imagespacemodifier|impactdataset|ingredient|inputenablelayer|instancenamingrules|key|keyword|leveledactor|leveleditem|leveledspell|light|location|locationalias|locationreftype|magiceffect|math|message|miscobject|movablestatic|musictype|objectmod|objectreference|outfit|outputmodel|package|perk|potion|projectile|quest|race|refcollectionalias|referencealias|scene|scriptobject|scroll|shaderparticlegeometry|shout|soulgem|sound|soundcategory|soundcategorysnapshot|spell|static|talkingactivator|terminal|textureset|topic|topicinfo|utility|visualeffect|voicetype|weapon|weather|wordofpower|worldspace";
    let functions = "abs|acos|activate|add|addachievement|addarray|addform|addinventoryeventfilter|additem|addkeyifneeded|addkeyword|addlinkedlocation|addperk|addperkpoints|addref|addrefcollection|addspell|addtextreplacementdata|addtofaction|addtomap|advanceskill|allowbleedoutdialogue|allowcompanion|allowpcdialogue|apply|applyconveyorbelt|applycrossfade|applyfanmotor|applyhavokimpulse|applytoref|asin|atan|attachashpile|attachmod|attachmodtoinventoryitem|attachto|attemptanimationsetswitch|blockactivation|calculateencounterlevel|callfunction|callfunctionnowait|callglobalfunction|callglobalfunctionnowait|canceltimer|canceltimergametime|canfasttraveltomarker|canflyhere|canpaycrimegold|canproduceforworkshop|cast|castas|ceiling|centeroncell|centeroncellandwait|changeanimarchetype|changeanimfacearchetype|changeanimflavor|changeheadpart|checkactoragainstfactionarray|checkformagainstarray|checklocationagainstarray|checklocationagainstlocationaliasarray|checkobjectagainstkeywordarray|checkobjectreferenceagainstarray|checkobjectreferenceagainstreferencealiasarray|clear|cleararrested|cleardestruction|clearexpressionoverride|clearextraarrows|clearforcedlandingmarker|clearhelpmessages|clearlookat|clearprison|cleartempeffects|closeuserlog|completeallobjectives|completequest|conveyorbelton|cos|countactors|countactorslinkedtome|countlinkedrefchain|countrefslinkedtome|create|createdetectionevent|damageobject|damagevalue|degreestoradians|delete|deletewhenable|disable|disableall|disablelinkchain|disablenowait|disableplayercontrols|disallowcompanion|dismember|dismount|dispel|dispelallspells|dispelspell|docombatspellapply|dogdropitems|dogplaceinmouth|drawweapon|drop|dropfirstobject|dropobject|dumpaliasdata|dumpeventregistrations|enable|enableactivate|enableai|enableall|enableambientparticles|enablecamswitch|enablecollisions|enabledetection|enablefasttravel|enablefavorites|enablefighting|enablejournal|enablelinkchain|enablelooking|enablemenu|enablemenus|enablemovement|enablenowait|enablepipboyhdrmask|enableplayercontrols|enablerunning|enablesneaking|enablesprinting|enablevats|enablezkey|enddeferredkill|equipitem|equipspell|error|evaluateall|evaluatepackage|fadeoutgame|failallobjectives|fanmotoron|fasttravel|find|findallreferencesoftype|findallreferenceswithkeyword|findclosestactor|findclosestactorfromref|findclosestreferenceofanytypeinlist|findclosestreferenceofanytypeinlistfromref|findclosestreferenceoftype|findclosestreferenceoftypefromref|findinreferencealiasarray|findrandomactor|findrandomactorfromref|findrandomreferenceofanytypeinlist|findrandomreferenceofanytypeinlistfromref|findrandomreferenceoftype|findrandomreferenceoftypefromref|findweather|fire|floor|followerfollow|followersetdistancefar|followersetdistancemedium|followersetdistancenear|followerwait|forceaddragdolltoworld|forcedisablessrgodraysdirlight|forcefirstperson|forcelocationto|forcerefifempty|forcerefto|forceremoveragdollfromworld|forcestart|forcethirdperson|gametimetostring|getactorbase|getactorowner|getactorreference|getactorrefowner|getactors|getactorslinkedtome|getaggressionav|getagilityav|getalias|getallcombattargets|getalllinkedlocations|getammo|getanglex|getangley|getanglez|getanimationvariablebool|getanimationvariablefloat|getanimationvariableint|getassociatedform|getassociatedskill|getat|getbaseobject|getbasevalue|getbribeamount|getcaps|getcasteractor|getcharismaav|getclass|getcombatstate|getcombattarget|getcomponentcount|getconfidenceav|getconfigname|getcontainer|getcount|getcrimefaction|getcrimegold|getcrimegoldnonviolent|getcrimegoldviolent|getcurrentdestructionstage|getcurrentgametime|getcurrentlocation|getcurrentpackage|getcurrentrealtime|getcurrentscene|getcurrentstackid|getcurrentstageid|getcurrentweather|getcurrentweathertransition|getdeadcount|getdialoguetarget|getdifficulty|getdistance|geteditorlocation|getencounterzone|getenduranceav|getequippeditemtype|getequippedshield|getequippedspell|getequippedweapon|getfactionowner|getfactionrank|getfactionreaction|getfirstfoundfactioninarrayforactor|getfirstfoundkeywordinarrayforlocation|getfirstownedobject|getflyingstate|getforcedlandingmarker|getform|getformfromfile|getformid|getgamesettingfloat|getgamesettingint|getgamesettingstring|getgiftfilter|getgoldamount|getgoldvalue|getheadingangle|gethealthav|getheight|gethighestrelationshiprank|getinfamy|getinfamynonviolent|getinfamyviolent|getintelligenceav|getinventoryvalue|getitemcount|getitemhealthpercent|getkey|getkeyworddata|getkiller|getlength|getlevel|getleveledactorbase|getlevelexact|getlightlevel|getlinkedref|getlinkedrefchain|getlinkedrefchildren|getlocation|getlocklevel|getlocreftypes|getlowestrelationshiprank|getluckav|getmass|getnobleedoutrecovery|getnthlinkedref|getobjectcomponentcount|getopenstate|getoutgoingweather|getowningquest|getparentcell|getperceptionav|getplatformname|getplayer|getplayercontrols|getplayerfollowers|getplayergrabbedref|getplayerlevel|getplayerradiofrequency|getplayerslastriddenhorse|getpositionx|getpositiony|getpositionz|getpropertyvalue|getqueststagedone|getrace|getradiofrequency|getradiovolume|getrealhourspassed|getreference|getrefslinkedtome|getreftypealivecount|getreftypedeadcount|getrelationshiprank|getresourcedamage|getsafeposition|getscale|getsex|getsitstate|getsize|getskymode|getsleepstate|getstate|getstolenitemvaluecrime|getstolenitemvaluenocrime|getstrengthav|getsuspiciousav|gettargetactor|getteleportcell|gettemplate|gettransitioncell|gettransmitterdistance|gettriggerobjectcount|getuniqueactor|getvalue|getvalueint|getvaluepercentage|getversionnumber|getvoicetype|getwidth|getworkshopownedobjects|getworkshopresourcedamage|getworkshopresourceobjects|getworldspace|getxpforlevel|giveplayercaps|gotostate|hasactorrefowner|hasassociation|hasbeensaid|hascommonparent|hasdetectionlos|hasdirectlos|haseffectkeyword|haseverbeencleared|hasfamilyrelationship|hasform|haskeyword|haskeywordinformlist|haslocreftype|hasmagiceffect|hasmagiceffectwithkeyword|hasnode|hasobjective|hasowner|hasparentrelationship|hasperk|hasreftype|hassharedpowergrid|hasspell|hidetitlesequencemenu|ignorefriendlyhits|incrementskill|incrementstat|initializemarkerdistances|interruptcast|is3dloaded|isactioncomplete|isactivatechild|isactivatecontrolsenabled|isactivateenabled|isactivationblocked|isactive|isactorinarrayhostiletoactor|isaienabled|isalarmed|isalerted|isallowedtofly|isarrested|isarrestingtarget|isattached|isbeingridden|isbeingriddenby|isbleedingout|isboundgameobjectavailable|isbribed|iscamswitchcontrolsenabled|iscamswitchenabled|ischild|iscleared|iscommandedactor|iscompleted|isconveyorbelton|iscreated|isdead|isdeleted|isdestroyed|isdetectedby|isdisabled|isdismembered|isdoingfavor|isenabled|isequipped|isessential|isfactionincrimegroup|isfanmotoron|isfasttravelcontrolsenabled|isfasttravelenabled|isfavoritescontrolsenabled|isfavoritesenabled|isfightingcontrolsenabled|isfightingenabled|isflying|isfurnitureinuse|isfurnituremarkerinuse|isghost|isguard|ishostile|ishostiletoactor|isignoringfriendlyhits|isincombat|isindialoguewithplayer|isinfaction|isininterior|isinironsights|isinkillmove|isinlocation|isinmenumode|isinpowerarmor|isinscene|isinterior|isintimidated|isinvulnerable|isjournalcontrolsenabled|isjournalenabled|islinkedlocation|isloaded|islockbroken|islocked|islookingcontrolsenabled|islookingenabled|ismapmarkervisible|ismenucontrolsenabled|ismenuenabled|ismovementcontrolsenabled|ismovementenabled|isnearplayer|isobjectivecompleted|isobjectivedisplayed|isobjectivefailed|isonmount|isoverencumbered|isownedby|isownedobjectinlist|isowner|isplayerenemy|isplayerexpelled|isplayerinradiorange|isplayerlistening|isplayerradioon|isplayerslastriddenhorse|isplayerteammate|isplaying|isplugininstalled|ispowered|isprotected|isquestitem|isradio|isradioon|isrefintransitioncell|isrunning|isrunningenabled|issamelocation|isseatoccupied|issneaking|issneakingcontrolsenabled|issneakingenabled|issprinting|issprintingenabled|isstagedone|isstarting|isstopped|isstopping|istalking|isteleportarealoaded|istrespassing|isunconscious|isunique|isvatscontrolsenabled|isvatsenabled|isvatsplaybackactive|isweapondrawn|iswithinbuildablearea|iszkeyenabled|kill|killall|killessential|killsilent|knockareaeffect|learnalleffects|learneffect|learnnexteffect|linkcollectionto|lock|makeplayerfriend|makeradioreceiver|maketransmitterrepeater|markitemasfavorite|max|mergewith|messagebox|min|mod|modcrimegold|modfactionrank|modifykeyworddata|modobjectiveglobal|modvalue|moveallto|moveto|movetoifunloaded|movetomyeditorlocation|movetonearestnavmeshlocation|movetonode|movetopackagelocation|mute|notification|openinventory|openuserlog|openworkshopsettlementmenu|openworkshopsettlementmenuex|passtime|pathtoreference|pause|pauseaudio|placeactoratme|placeatme|placeatnode|play|playandwait|playanimation|playanimationandwait|playbink|playerknows|playermovetoandwait|playerpaycrimegold|playeventcamera|playgamebryoanimation|playidle|playidleaction|playidlewithtarget|playimpacteffect|playsubgraphanimation|playsyncedanimationandwaitss|playsyncedanimationss|playterraineffect|popto|pow|precachechargen|precachechargenclear|preloadexteriorcell|preloadtargetarea|processtraphit|push|pushactoraway|querystat|quitgame|quittomainmenu|radianstodegrees|ramprumble|randomfloat|randomint|recalculateresources|registerforanimationevent|registerforcustomevent|registerfordetectionlosgain|registerfordetectionloslost|registerfordirectlosgain|registerfordirectloslost|registerfordistancegreaterthanevent|registerfordistancelessthanevent|registerforhitevent|registerforlooksmenuevent|registerformagiceffectapplyevent|registerformenuopencloseevent|registerforplayersleep|registerforplayerteleport|registerforplayerwait|registerforradiationdamageevent|registerforremoteevent|registerfortrackedstatsevent|registerfortutorialevent|releaseoverride|remotecast|remove|removeaddedform|removeall|removeallinventoryeventfilters|removeallitems|removeallmods|removeallmodsfrominventoryitem|removecomponents|removecrossfade|removefromallfactions|removefromfaction|removefromref|removeinventoryeventfilter|removeitem|removeitembycomponent|removekeyword|removelinkedlocation|removemod|removemodfrominventoryitem|removeperk|removeplayercaps|removeref|removespell|repair|requestautosave|requestmodel|requestsave|reset|resetall|resethealthandlimbs|resethelpmessage|resetkeyword|resetspeechchallenges|restorevalue|resumeaudio|resurrect|reverseconveyorbelt|revert|rewardplayerxp|say|saycustom|sellitem|sendassaultalarm|sendcustomevent|sendplayertojail|sendstealalarm|sendstoryevent|sendstoryeventandwait|sendtrespassalarm|servetime|setactivatetextoverride|setactive|setactorcause|setactorowner|setactorrefowner|setalert|setallowflying|setally|setalpha|setangle|setanimarchetypeconfident|setanimarchetypedepressed|setanimarchetypeelderly|setanimarchetypefriendly|setanimarchetypeirritated|setanimarchetypenervous|setanimarchetypeneutral|setanimationvariablebool|setanimationvariablefloat|setanimationvariableint|setattackactoronsight|setattractionactive|setavailabletobecompanion|setavoidplayer|setbribed|setcameratarget|setcandocommand|setchargenhudmode|setcleared|setcombatstyle|setcommandstate|setcompanion|setconveyorbeltvelocity|setcrimefaction|setcrimegold|setcrimegoldviolent|setcriticalstage|setcurrentstageid|setdestroyed|setdirectattarget|setdoganimarchetypeagitated|setdoganimarchetypealert|setdoganimarchetypeneutral|setdoganimarchetypeplayful|setdoingfavor|setenemy|setessential|seteyetexture|setfactionowner|setfactionrank|setfogcolor|setfogplanes|setfogpower|setfootik|setforcedlandingmarker|setfrequency|setghost|setgodmode|setharvested|sethaschargenskeleton|setheadtracking|setinchargen|setinibool|setinifloat|setiniint|setinistring|setinsidememoryhudmode|setinstancevolume|setintimidated|setinvulnerable|setkeyworddata|setlinkedref|setlocklevel|setlocreftype|setlookat|setmotiontype|setnobleedoutrecovery|setnofavorallowed|setnotshowonstealthmeter|setobjectivecompleted|setobjectivedisplayed|setobjectivefailed|setobjectiveskipped|setopen|setoutfit|setoverridevoicetype|setpersistloc|setplayeraidriven|setplayercontrols|setplayerenemy|setplayerexpelled|setplayerhastaken|setplayeronelevator|setplayerradiofrequency|setplayerreportcrime|setplayerresistingarrest|setplayerteammate|setposition|setpropertyvalue|setpropertyvaluenowait|setprotected|setpublic|setqueststage|setrace|setradiofrequency|setradioon|setradiovolume|setrelationshiprank|setrestrained|setscale|setsittingrotation|setsubgraphfloatvariable|setunconscious|setvalue|setvalueint|setvehicle|setvolume|shakecamera|shakecontroller|show|showallmapmarkers|showashelpmessage|showbartermenu|showfatiguewarningonhud|showfirstpersongeometry|showonpipboy|showperkvaultboyonhud|showpipboybootsequence|showpipboyplugin|showracemenu|showspecialmenu|showtitlesequencemenu|showtrainingmenu|sin|snapintointeraction|splinetranslateto|splinetranslatetoref|splinetranslatetorefnode|sqrt|start|startcannibal|startcombat|startcombatall|startdeferredkill|startdialoguecameraorcenterontarget|startfrenzyattack|startobjectprofiling|startscriptprofiling|startsneaking|startstackprofiling|startstackrootprofiling|starttimer|starttimergametime|starttitlesequence|startvampirefeed|startworkshop|stop|stopcombat|stopcombatalarm|stopdialoguecamera|stopinstance|stopobjectprofiling|stopscriptprofiling|stopstackprofiling|stopstackrootprofiling|stoptranslation|storeinworkshop|switchtopowerarmor|tan|tethertohorse|trace|traceandbox|traceconditional|traceconditionalglobal|tracefunction|traceself|tracestack|traceuser|translateto|translatetoref|trapsoul|triggerscreenblood|trytoaddtofaction|trytoclear|trytodisable|trytodisablenowait|trytoenable|trytoenablenowait|trytoevaluatepackage|trytogetvalue|trytokill|trytomoveto|trytoremovefromfaction|trytoreset|trytosetvalue|trytostopcombat|turnplayerradioon|unequipall|unequipitem|unequipitemslot|unequipspell|unlock|unlockowneddoorsincell|unmute|unpause|unregisterforallcustomevents|unregisterforallevents|unregisterforallhitevents|unregisterforallmagiceffectapplyevents|unregisterforallmenuopencloseevents|unregisterforallradiationdamageevents|unregisterforallremoteevents|unregisterforalltrackedstatsevents|unregisterforanimationevent|unregisterforcustomevent|unregisterfordistanceevents|unregisterforhitevent|unregisterforlooksmenuevent|unregisterforlos|unregisterformagiceffectapplyevent|unregisterformenuopencloseevent|unregisterforplayersleep|unregisterforplayerteleport|unregisterforplayerwait|unregisterforradiationdamageevent|unregisterforremoteevent|unregisterfortrackedstatsevent|unregisterfortutorialevent|unshowashelpmessage|updatecurrentinstanceglobal|usinggamepad|wait|waitfor3dload|waitforanimationevent|waitforworkshopresourcerecalc|waitgametime|waitmenumode|warning|willintimidatesucceed|wornhaskeyword|wouldbestealing|wouldrefusecommand|getstage|getstagedone|setstage|findstruct|insert|removelast|rfind|rfindstruct|forceactive|getclassification|setactive";
    let events = "";
    let sDir = "";
    let sDirScriptNames = "";
    let sDirFunctions = "";
    let sDirEvents = "";
    let sFunction = "function";
    let sEvent = "event";
    let count = 0;

    let textEditor = vscode.window.activeTextEditor;

    if (textEditor !== undefined){
        //successNotification("output folder set");
        
        let fullFilePath = textEditor.document.fileName;
        sDir = path.dirname(fullFilePath);

        if (sDir !== undefined && sDir !== "" && sDir !== savedSkyrimSourcePath){
            fs.readdirSync(sDir).forEach(file => {
                let extt = path.extname(file);
                if (extt === ".psc"){
                    count += 1;
                    if (count % 100 === 0){
                        showNotification(count + ' psc files checked.');
                    }
                    
                    const fileContents = fs.readFileSync((sDir + "\\" + file), 'utf-8');
                    let lines = fileContents.split("\n");
                    //compilerOutput.appendLine(count + ' psc files checked. Number of lines = ' + lines.length);

                    for (let i = 0; i < lines.length; i ++){
                        let line = lines[i].toLowerCase();

                        let functionIndex = line.indexOf(sFunction);
                        if(functionIndex !== -1){
                            if (functionIndex !== 0){
                                let char = line.charAt(functionIndex - 1);
                                if (char !== " " && char !== "\t"){ //"function" not preceded by white space
                                    continue;
                                }
                            }

                            functionIndex += (sFunction.length);

                            let iStart = getNextNonWhiteSpaceIndex(line, (functionIndex));
                            
                            if (iStart !== -1){
                                if (iStart === functionIndex){ //no whitespace after "function"
                                    continue;
                                }

                                let iEnd = line.indexOf("(", iStart); 
                                if (iEnd !== -1){
                                    let functionName = line.substring(iStart, iEnd) + "|";
                                    if (sDirFunctions.indexOf("|" + functionName) === -1){
                                        if (functionName.indexOf(' ') === -1 && functionName.indexOf("\t") === -1){

                                            sDirFunctions += functionName;

                                            let scriptNameNoExtension = file.slice(0, file.length - 4) + "|";
                                            if (sDirScriptNames.indexOf("|" + scriptNameNoExtension) === -1){
                                                sDirScriptNames += scriptNameNoExtension;
                                            }
                                            continue;
                                        }
                                    }
                                }
                            }
                        }

                        let eventIndex = line.indexOf(sEvent);
                        if(eventIndex !== -1){
                            if (eventIndex !== 0){
                                let char = line.charAt(eventIndex - 1);
                                if (char !== " " && char !== "\t"){ //no white space before "event"
                                    continue;
                                }
                            }

                            eventIndex += (sEvent.length);
                            let iStart = getNextNonWhiteSpaceIndex(line, (eventIndex));
                        
                            if (iStart !== -1){
                                if (iStart === eventIndex){ //no whitespace after "event"
                                    continue;
                                }
        
                                let iEnd = line.indexOf("(", iStart);
                                if (iEnd !== -1){
                                    let eventName = line.substring(iStart, iEnd) + "|";
                                    if (sDirEvents.indexOf("|" + eventName) === -1){
                                        if (eventName.indexOf(' ') === -1 && eventName.indexOf("\t") === -1){
                                        
                                            sDirEvents += eventName;

                                            let scriptNameNoExtension = file.slice(0, file.length - 4) + "|";
                                            if (sDirScriptNames.indexOf("|" + scriptNameNoExtension) === -1){
                                                sDirScriptNames += scriptNameNoExtension;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }            
            });
        }
    }

    if (savedSkyrimSourcePath !== "" && savedSkyrimSourcePath !== undefined){
        compilerOutput.show();
        compilerOutput.appendLine('printing psc keyword data...\n\n');
        
        fs.readdirSync(savedSkyrimSourcePath).forEach(file => {
            let extt = path.extname(file);
            if (extt === ".psc"){
                count += 1;
                if (count % 100 === 0){
                    showNotification(count + ' psc files checked.');
                }
                
                const fileContents = fs.readFileSync((savedSkyrimSourcePath + "\\" + file), 'utf-8');
				let printAllFunctions:boolean = (fileContents.toLowerCase().indexOf("native") !== -1); //found at least 1 native function.
                let lines = fileContents.split("\n");
                //compilerOutput.appendLine(count + ' psc files checked. Number of lines = ' + lines.length);

                for (let i = 0; i < lines.length; i ++){
                    let line = lines[i].toLowerCase();

                    let functionIndex = line.indexOf(sFunction);
                    if(functionIndex !== -1){
						if (!printAllFunctions){
							if (line.indexOf("native") === -1 && line.indexOf("global") === -1){
								continue;
							}
						}
                       
                        if (functionIndex !== 0){
                            let char = line.charAt(functionIndex - 1);
                            if (char !== " " && char !== "\t"){ //"function" not preceded by white space
                                continue;
                            }
                        }

                        functionIndex += (sFunction.length);

                        let iStart = getNextNonWhiteSpaceIndex(line, (functionIndex));
                        
                        if (iStart !== -1){
							if (iStart === functionIndex){ //no whitespace after "function"
								continue;
							}

                            let iEnd = line.indexOf("(", iStart); 
                            if (iEnd !== -1){
                                let functionName = line.substring(iStart, iEnd) + "|";
                                if (functions.indexOf("|" + functionName) === -1){
                                    if (functionName.indexOf(' ') === -1 && functionName.indexOf("\t") === -1){

                                        functions += functionName;

                                        let scriptNameNoExtension = file.slice(0, file.length - 4) + "|";
                                        if (scriptNames.indexOf("|" + scriptNameNoExtension) === -1){
                                            scriptNames += scriptNameNoExtension;
                                        }
                                        continue;
                                    }
                                }
                            }
                        }
                    }

                    let eventIndex = line.indexOf(sEvent);
                    if(eventIndex !== -1){
                        if (eventIndex !== 0){
                            let char = line.charAt(eventIndex - 1);
                            if (char !== " " && char !== "\t"){ //no white space before "event"
                                continue;
                            }
                        }

                        eventIndex += (sEvent.length);
                        let iStart = getNextNonWhiteSpaceIndex(line, (eventIndex));
                       
                        if (iStart !== -1){
							if (iStart === eventIndex){ //no whitespace after "event"
								continue;
							}
	
                            let iEnd = line.indexOf("(", iStart);
                            if (iEnd !== -1){
                                let eventName = line.substring(iStart, iEnd) + "|";
                                if (events.indexOf("|" + eventName) === -1){
                                    if (eventName.indexOf(' ') === -1 && eventName.indexOf("\t") === -1){
                                       
                                        events += eventName;

                                        let scriptNameNoExtension = file.slice(0, file.length - 4) + "|";
                                        if (scriptNames.indexOf("|" + scriptNameNoExtension) === -1){
                                            scriptNames += scriptNameNoExtension;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }            
        });
    }

    if (sDirScriptNames !== ""){
        let sDirScriptNamesArray = sDirScriptNames.split("|");
        sDirScriptNamesArray.sort();
        sDirScriptNames = sDirScriptNamesArray.join("|");
        compilerOutput.appendLine(sDir + " - script names:\n");
        compilerOutput.appendLine(sDirScriptNames + "\n\n");
    }

    if (sDirFunctions !== ""){
        let sDirFunctionsArray = sDirFunctions.split("|");
        sDirFunctionsArray.sort();
        sDirFunctions = sDirFunctionsArray.join("|");
        compilerOutput.appendLine(sDir + " - script names:\n");
        compilerOutput.appendLine(sDirFunctions + "\n\n");
    }

    if (sDirEvents !== ""){
        let sDirEventsArray = sDirEvents.split("|");
        sDirEventsArray.sort();
        sDirEvents = sDirEventsArray.join("|");
        compilerOutput.appendLine(sDir + " - script names:\n");
        compilerOutput.appendLine(sDirEvents + "\n\n");
    }

    let scriptNamesArray = scriptNames.split("|");
    let functionsArray = functions.split("|");
    let eventsArray = events.split("|");

    scriptNamesArray.sort();
    functionsArray.sort();
    eventsArray.sort();

    scriptNames = scriptNamesArray.join("|");
    functions = functionsArray.join("|");
    events = eventsArray.join("|");

    compilerOutput.appendLine("\nbase game sorce folder - script names:\n");
    compilerOutput.appendLine(scriptNames + "\n");

    compilerOutput.appendLine("\nbase game sorce folder - functions:\n");
    compilerOutput.appendLine(functions + "\n");

    compilerOutput.appendLine("\nbase game sorce folder - Events:\n");
    compilerOutput.appendLine(events);

    compilerOutput.show();
}

export function getNextNonWhiteSpaceIndex(s:string, startIndex:number): number{
    for(startIndex; startIndex < s.length; startIndex++){
        let char = s.charAt(startIndex);
        if (char !== " " && char !== "\t"){
            return startIndex;
        }
    }
    return -1;
}

export function getNextWhiteSpaceIndex(s:string, startIndex:number): number{
    for(startIndex; startIndex < s.length; startIndex++){
        let char = s.charAt(startIndex);
        if (char === " " || char === "\t"){
            return startIndex;
        }
    }
    return -1;
}

export async function compilePapyrusScript(fullFilePath:string, clearOutput:boolean, playSound:boolean = true): Promise<boolean>{
    let returnValue:boolean = false;
    let ext = path.extname(fullFilePath);
    
    if (ext === ".psc"){
        if (clearOutput === true){
            compilerOutput.clear();
        } else {
            compilerOutput.append("\n-----------------------------------------------------------------------\n\n");
        }

        compilerOutput.appendLine("Starting compile of " + path.basename(fullFilePath) + "\n");
        compilerOutput.show();

        let pexOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPex;
        let pexOutputFolders = pexOutputFolder.split(";");
        let outputToSkyrimScriptsFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').AlwaysOutputToSkyrimScriptsFolder;
        let sDir = path.dirname(fullFilePath);
        let importPaths = sDir;
        let skyrimRootPath = "";
        let compilerPath = "";
        let flagsPath = "";
        let scriptsPath = pexOutputFolders[0];

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
            // compilerOutput.appendLine("compileCommand = [" + compileCommand + "]");

            await new Promise<void>((resolve, reject) => {
                cp.exec(compileCommand, (err, stdout, stderr) => {
                    let msg = stdout;
                    compilerOutput.appendLine(msg);

                    if (stderr !== ""){
                        errorNotification(stderr, playSound);
                    } else {
                        returnValue = true;
                        successNotification(path.basename(fullFilePath) + ' compiled succesfully', playSound);
                            
                        let pscName = path.basename(fullFilePath);
                        let pexName = pscName.slice(0, pscName.length - 4) + ".pex";

                        let savedPexFoldersForFile = getSaveFoldersForScript(pexName);
                        
                        if (savedPexFoldersForFile !== ""){
                            if (pexOutputFolder === "" || pexOutputFolder === undefined){
                                pexOutputFolder = savedPexFoldersForFile;
                            } else {
                                pexOutputFolder += (";" + savedPexFoldersForFile);
                            }
                        }

                        if (pexOutputFolder !== "" && pexOutputFolder !== undefined){
                            pexOutputFolders = pexOutputFolder.split(";");
                
                            if ((pexOutputFolder !== "" && pexOutputFolder !== undefined) || (savedPexFoldersForFile !== "" && savedPexFoldersForFile !== undefined) ){
                                let m = pexOutputFolders.length;
                                for(let i = 0; i < m; i++){
                                    if(pexOutputFolders[i] === scriptsPath){
                                        pexOutputFolders.splice(i, 1); //remove folder from pexOutputFolders
                                    }
                                }

                                //compilerOutput.appendLine("pexOutputFolders = " + pexOutputFolders);
                                //compilerOutput.show();

                                m = pexOutputFolders.length;
                                if (m > 0){
                                    let hadAnErr = false;
                                    
                                    let copyPath = scriptsPath + "\\" + pexName;
                                    
                                    for(let i = 0; i < m; i++){
                                        let destinationPath = pexOutputFolders[i] + "\\" + pexName;
                                        fs.copyFile(copyPath, destinationPath, (err) => {
                                            if (err){
                                                hadAnErr = true;
                                                compilerOutput.appendLine('failed to copy ' + copyPath + ' to ' + destinationPath);
                                            } 
                                            resolve();
                                        });
                                    }
                                    if (hadAnErr){
                                        errorNotification("copy error", playSound); //play error sound if there is one
                                        compilerOutput.show();
                                    }
                                }
                            }
                        }

                        let pscOutputFolder = getSaveFoldersForScript(pscName);
                        let savedPscOutputFolder = vscode.workspace.getConfiguration('DylbillsVsSkyrimScriptCompiler').OutputFolderPsc;
                        
                        if (savedPscOutputFolder !== undefined && savedPscOutputFolder !== ""){
                            if (pscOutputFolder === ""){
                                pscOutputFolder = savedPscOutputFolder;
                            } else {
                                (pscOutputFolder += (";" + savedPscOutputFolder));
                            }
                        }

                        if (pscOutputFolder !== undefined && pscOutputFolder !== ""){
                            let pscOutputFolders = pscOutputFolder.split(";");
                            let m = pscOutputFolders.length;
                            for(let i = 0; i < m; i++){
                                if(pscOutputFolders[i] === sDir){
                                    pscOutputFolders.splice(i, 1);
                                }
                            }

                            //compilerOutput.appendLine("pscOutputFolders = " + pscOutputFolders);
                            //compilerOutput.show();

                            m = pscOutputFolders.length;

                            if (m > 0){
                                let hadAnErr = false;

                                for(let i = 0; i < m; i++){
                                    let destinationPath = pscOutputFolders[i] + "\\" + pscName;
                                    //vscode.window.showInformationMessage('pexName = ' + pexName);
                                    fs.copyFile(fullFilePath, destinationPath, (err) => {
                                        if (err){
                                            hadAnErr = true;
                                            compilerOutput.appendLine('failed to copy ' + fullFilePath + ' to ' + destinationPath);
                                        } 
                                        resolve();
                                    });
                                }
                                if (hadAnErr){
                                    errorNotification("copy error", playSound); //play error sound if there is one
                                }
                            }
                        }
                    }
                    compilerOutput.show();
                    resolve(); //resolve no matter what
                });
            });
        } else {
            errorNotification('Skyrim root folder not found. Compile a script from data/scripts/source or data/source/scripts first before compiling from an external folder.', playSound);
            compilerOutput.show();
        }
    } else {
        errorNotification(path.basename(fullFilePath) + ' is not a papyrus (.psc) script.', playSound);
        compilerOutput.show();
    }

    return returnValue;
}

//if extension is "." returns all open file paths, otherwise use ".psc", ".txt" ect to filter file types.
export function getFilePathsOfOpenTabs(extension:string = "."): string[] {
    let pscPaths:string[] = [];

	for (const tabGroup of vscode.window.tabGroups.all) {
        for (const tab of tabGroup.tabs) {
            const tabInput = tab.input;
            if (tabInput instanceof vscode.TabInputText) {
                let filePath = tabInput.uri.path;
                if (filePath.at(0) === "/"){
                    filePath = filePath.substring(1);
                }

                filePath = filePath.replace(/\//g, "\\");

                let ext = path.extname(filePath);
                if (ext === extension || extension === "."){
                    pscPaths.push(filePath);
                }
            }
        }
    }

    return pscPaths;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
} 

// export function stringReplaceAll(targetString: string, searchValue:string, replaceValue:string): string{
//     let s = targetString;
//     if (s === ""){
//         return s;
//     }

//     if (searchValue === "" || searchValue === replaceValue){
//         return s;
//     }

//     let index:number = s.indexOf(searchValue);

//     while (index > -1) {
//         s.replace(searchValue, replaceValue);
//         index = s.indexOf(searchValue);
//         compilerOutput.append(searchValue + " index = " + index);
//     }

//     return s;
// }