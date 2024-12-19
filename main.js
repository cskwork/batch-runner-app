const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('select-batch-file', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Batch Files', extensions: ['bat', 'cmd'] }
        ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        event.reply('batch-file-selected', result.filePaths[0]);
    }
});

function ensureDirectoryExists(dirPath) {
    dirPath = dirPath.replace(/\\+$/, '');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
}

// Store operations
ipcMain.handle('load-batch-files', () => {
    return store.get('batchFiles', []);
});

ipcMain.handle('save-batch-files', (event, batchFiles) => {
    store.set('batchFiles', batchFiles);
    return true;
});

ipcMain.handle('load-execution-history', () => {
    return store.get('executionHistory', []);
});

ipcMain.on('run-batch-file', (event, { filePath, args }) => {
    if (!filePath) {
        event.reply('batch-file-run-result', {
            success: false,
            error: 'No batch file selected'
        });
        return;
    }

    try {
        const normalizedBatchPath = path.win32.normalize(filePath);
        const argParts = args.match(/"[^"]+"/g);
        if (!argParts || argParts.length !== 2) {
            throw new Error('Invalid arguments. Both source and destination paths are required.');
        }

        const sourcePath = path.win32.normalize(argParts[0].replace(/"/g, ''));
        let destPath = path.win32.normalize(argParts[1].replace(/"/g, ''));

        destPath = ensureDirectoryExists(destPath);
        const command = `cmd.exe /c chcp 65001 > nul && "${normalizedBatchPath}" "${sourcePath}" "${destPath}"`;
        
        // Save to history before execution
        const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            batchFile: filePath,
            sourcePath,
            destPath,
            command
        };

        exec(command, {
            windowsHide: true,
            encoding: 'utf8',
            env: {
                ...process.env,
                LANG: 'ko_KR.UTF-8'
            }
        }, (error, stdout, stderr) => {
            // Update history with execution result
            historyEntry.success = !error;
            historyEntry.output = error ? error.message : stdout;
            historyEntry.error = stderr;

            const history = store.get('executionHistory', []);
            history.unshift(historyEntry);
            store.set('executionHistory', history.slice(0, 100)); // Keep last 100 executions

            if (error) {
                event.reply('batch-file-run-result', {
                    success: false,
                    error: `${error.message}\nCommand: ${command}`
                });
                return;
            }

            event.reply('batch-file-run-result', {
                success: true,
                stdout: stdout.toString('utf8'),
                stderr: stderr.toString('utf8')
            });
        });
    } catch (error) {
        event.reply('batch-file-run-result', {
            success: false,
            error: `Error: ${error.message}`
        });
    }
});