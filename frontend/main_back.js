import { app, BrowserWindow, Menu, screen, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 512,
    height: 812,
    frame: true,
    resizable: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  })

  Menu.setApplicationMenu(null)
  mainWindow.webContents.openDevTools()

  // const devServerUrl = 'http://localhost:5173'
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.loadURL(devServerUrl)
  // } else {
  //   mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
  // }

  mainWindow.loadURL("http://localhost:5173")

  mainWindow.on('close', () => {
    disconnectVPN() // Ensure VPN disconnects when the app closes
  })
})

// Function to disconnect VPN using exec
const disconnectVPN = () => {
  exec(`python "${path.join(__dirname, 'python', 'disconnect.py')}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error disconnecting VPN: ${stderr || error.message}`)
    } else {
      console.log(`VPN disconnected: ${stdout}`)
    }
  })
}

// Get WireGuard IP
const getWireGuardIP = (callback) => {
  exec(
    'powershell -Command "(Get-NetIPAddress -InterfaceAlias wg0 -AddressFamily IPv4).IPAddress"',
    (error, stdout) => {
      if (error || !stdout.trim()) {
        return callback(null) // No IP found
      }
      callback(stdout.trim()) // Return only the extracted IP
    }
  )
}

// Run Python script using exec
ipcMain.on('run-python', (_, scriptName) => {
  exec(`python "${path.join(__dirname, 'python', scriptName)}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running script: ${stderr || error.message}`)
    } else {
      console.log(`Script executed: ${stdout}`)
    }
  })
})

// Get WireGuard IP
ipcMain.handle('get-wg-ip', async () => {
  return new Promise((resolve) => {
    getWireGuardIP((ip) => {
      resolve(ip || 'Not Connected')
    })
  })
})

// Run a custom command and return extracted numeric value
ipcMain.handle('run-command', async (_, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message)
      } else {
        const output = stdout.trim()
        // Extract numeric value from the received data
        const match = output.match(/(\d+)\s*\S*\s*received/)
        const receivedBytes = match ? parseInt(match[1], 10) : 0
        resolve(receivedBytes)
      }
    })
  })
})

app.on('window-all-closed', () => {
  disconnectVPN() // Ensure VPN disconnects when all windows are closed
  if (process.platform !== 'darwin') app.quit()
})
