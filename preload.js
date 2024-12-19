const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectBatchFile: () => ipcRenderer.send('select-batch-file'),
    onBatchFileSelected: (callback) => {
        ipcRenderer.on('batch-file-selected', (event, ...args) => callback(...args));
    },
    runBatchFile: (filePath, args) => ipcRenderer.send('run-batch-file', { filePath, args }),
    onBatchFileRunResult: (callback) => {
        ipcRenderer.on('batch-file-run-result', (event, ...args) => callback(...args));
    },
    // Store operations
    loadBatchFiles: () => ipcRenderer.invoke('load-batch-files'),
    saveBatchFiles: (batchFiles) => ipcRenderer.invoke('save-batch-files', batchFiles),
    // History operations
    loadExecutionHistory: () => ipcRenderer.invoke('load-execution-history'),
    // Helper function to format dates
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
});