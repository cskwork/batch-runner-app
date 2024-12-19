# Batch Runner

A desktop application built with Electron for managing and running Windows batch files with a user-friendly interface.

## Features

- 🚀 Easy-to-use graphical interface for running batch files
- 💾 Save and manage multiple batch files
- 📝 Configure source and destination paths for each batch file
- 📋 View execution history
- 🔄 Restore previous execution contexts
- 💡 Command preview before execution
- 📊 Real-time execution output
- 🔒 Persistent storage of settings

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd batch-runner-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the application in development mode:
```bash
npm start
```

## Building the Application

### For Development

1. Install development dependencies:
```bash
npm install electron-packager --save-dev
```

2. Run the packaging script:
```bash
npm run package
```

This will create a portable executable in the `dist/BatchRunner-win32-x64` directory.

## Using the Application

### Running the Packaged Application

1. Navigate to `dist/BatchRunner-win32-x64`
2. Run `BatchRunner.exe`

### Adding Batch Files

1. Click "Add Batch File" button
2. Select your batch file using the file picker
3. Configure the source and destination paths:
   - Source Path: Path to the file or directory that the batch file will process
   - Destination Path: Path where the batch file will output results

### Running Batch Files

1. Select a batch file from your list
2. Verify the source and destination paths
3. Click "Run" to execute the batch file
4. View the output in real-time in the output window

### Using History

1. Click the "History" tab to view previous executions
2. Each history entry shows:
   - Timestamp of execution
   - Command that was run
   - Execution result
3. Click on any history entry to restore its execution context

## Distribution

The application can be distributed in two ways:

### Portable Version
- Copy the entire `BatchRunner-win32-x64` folder
- Share it with users
- Users can run the application directly from `BatchRunner.exe`

### Installation Package
To create an installation package:

1. Update package.json with installer configuration:
```json
{
  "build": {
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

2. Run the build command:
```bash
npm run build
```

## Troubleshooting

### Common Issues

1. **Batch file not running**
   - Ensure the batch file has the correct permissions
   - Verify the paths contain no invalid characters
   - Check the output window for error messages

2. **Settings not saving**
   - Ensure the application has write permissions in its directory
   - Check if antivirus is blocking file operations

3. **Path errors**
   - Use full paths rather than relative paths
   - Avoid special characters in paths
   - Ensure all directories exist

## Technical Details

- Built with Electron v28
- Uses electron-store for persistent storage
- Implements IPC (Inter-Process Communication) for secure batch file execution
- Runs batch files in isolated processes
- Supports UTF-8 encoding for proper character handling

## Security Notes

- The application runs batch files with the same permissions as the user
- Always verify batch file contents before running
- Be cautious with batch files from unknown sources
- Review paths before execution to prevent unintended operations

## License

ISC License