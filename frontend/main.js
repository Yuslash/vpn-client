import { app, BrowserWindow, Menu, ipcMain, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import http from 'http'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow
let server

// Function to get correct Python script path
const getPythonScriptPath = (scriptName) => {
  if (process.env.NODE_ENV === 'development') {
    // Dev mode - look in the local python folder
    return path.join(__dirname, 'python', scriptName)
  } else {
    // Production mode - look in resources/python after build
    return path.join(process.resourcesPath, 'python', scriptName)
  }
}

// Check admin privileges
const checkAdminPrivileges = (callback) => {
  exec('NET SESSION', (err, stdout, stderr) => {
    callback(stderr.length === 0)
  })
}

// Function to disconnect VPN
const disconnectVPN = () => {
  const scriptPath = getPythonScriptPath('disconnect.py')
  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error disconnecting VPN: ${stderr || error.message}`)
    } else {
      console.log(`VPN disconnected: ${stdout}`)
    }
  })
}

// Get WireGuard IP address
const getWireGuardIP = (callback) => {
  exec(
    'powershell -Command "(Get-NetIPAddress -InterfaceAlias wg0 -AddressFamily IPv4).IPAddress"',
    (error, stdout) => {
      callback(error || !stdout.trim() ? null : stdout.trim())
    }
  )
}

// Function to log cookies
const logCookies = () => {
  session.defaultSession.cookies
    .get({})
    .then((cookies) => {
      console.log('Cookies:', cookies)
    })
    .catch((error) => {
      console.error('Error fetching cookies:', error)
    })
}

// Create the main application window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 512,
    height: 812,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  Menu.setApplicationMenu(null)
  mainWindow.webContents.openDevTools()

  // Load the app via HTTP server to avoid file:// issues
  mainWindow.loadURL('http://192.168.237.18:8000')

  mainWindow.webContents.once('did-finish-load', () => {
    logCookies() // Log cookies after the page finishes loading
  })

  mainWindow.on('close', () => {
    disconnectVPN() // Disconnect VPN before closing
  })
}

// Run Python script dynamically
ipcMain.on('run-python', (_, scriptName) => {
  const scriptPath = getPythonScriptPath(scriptName)
  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running script: ${stderr || error.message}`)
    } else {
      console.log(`Script executed: ${stdout}`)
    }
  })
})

// Get WireGuard IP for frontend
ipcMain.handle('get-wg-ip', async () => {
  return new Promise((resolve) => {
    getWireGuardIP((ip) => {
      resolve(ip || 'Not Connected')
    })
  })
})

// Run a custom command and return numeric value
ipcMain.handle('run-command', async (_, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message)
      } else {
        const output = stdout.trim()
        const match = output.match(/(\d+)\s*\S*\s*received/)
        const receivedBytes = match ? parseInt(match[1], 10) : 0
        resolve(receivedBytes)
      }
    })
  })
})

// Quit app when all windows are closed
app.on('window-all-closed', () => {
  disconnectVPN() // Disconnect VPN to ensure safety
  if (process.platform !== 'darwin') app.quit()
})

const startLocalServer = (callback) => {
  const buildPath = path.join(__dirname, 'build')

  server = http.createServer((req, res) => {
    let filePath = path.join(buildPath, req.url === '/' ? 'index.html' : req.url)

    // Get the extension to determine content type
    const extname = path.extname(filePath)
    let contentType = 'text/html'

    switch (extname) {
      case '.js':
        contentType = 'text/javascript'
        break
      case '.css':
        contentType = 'text/css'
        break
      case '.json':
        contentType = 'application/json'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.jpg':
        contentType = 'image/jpg'
        break
      case '.svg':
        contentType = 'image/svg+xml'
        break
      default:
        contentType = 'text/html'
    }

    // Check if file exists
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // If file is not found, load index.html for SPA routing
        if (err.code === 'ENOENT') {
          fs.readFile(path.join(buildPath, 'index.html'), (error, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(content, 'utf-8')
          })
        } else {
          res.writeHead(500)
          res.end(`Error loading file: ${err.code}`)
        }
      } else {
        // Serve the correct content type
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(data, 'utf-8')
      }
    })
  })

  server.listen(8000, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8000')
    callback()
  })
}


// App ready and initialization
app.whenReady().then(() => {
  checkAdminPrivileges((isAdmin) => {
    if (!isAdmin) {
      console.error('Admin privileges required! Exiting...')
      app.quit()
    } else {
      console.log('App is running with admin privileges.')
      startLocalServer(createMainWindow)
    }
  })
})

// Handle app exit to properly close server
app.on('before-quit', () => {
  if (server) {
    server.close()
  }
})
