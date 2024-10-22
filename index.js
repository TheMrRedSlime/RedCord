const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');


let mainWindow;
let cssContent = '';

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    }
  });

  // Load Discord initially
  mainWindow.loadURL('https://discord.com/app');

  mainWindow.webContents.executeJavaScript('document.title = "RedCord"')
  mainWindow.webContents.executeJavaScript('if(redcord.storage.get().css != null || redcord.storage.get().css != "") { const styleElement = document.createElement("style"); styleElement.textContent = redcord.storage.get().css; document.head.appendChild(styleElement); }')
  globalShortcut.register('CommandOrControl+Alt+C', () => {
    createCSSDialog();
  });
});

function createCSSDialog() {
  // JavaScript code to create a custom dialog
  const dialogJS = `
  function createCssInjector() {
    // Check if the container already exists
    const existingContainer = document.querySelector(".css-injector-container");
  
    if (document.querySelector(".css-injector-container")) {
      document.body.removeChild(existingContainer);
      return;
    }
  
    // Create a container for the button, input, toggle button, and remove button
    const container = document.createElement("div");
    container.className = "css-injector-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.right = "0";
    container.style.padding = "10px";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    container.style.color = "white";
    container.style.zIndex = "9999";
  
    // Create a text input field
    const cssInput = document.createElement("input");
    cssInput.type = "text";
    cssInput.placeholder = "Enter CSS here";
    cssInput.style.marginRight = "10px";
  
    // Create a button to inject CSS
    const injectButton = document.createElement("button");
    injectButton.textContent = "Inject CSS";
    injectButton.style.backgroundColor = "red";
    injectButton.style.color = "white";
    injectButton.style.border = "none";
    injectButton.style.cursor = "pointer";
    // Add event listener to the inject button
    injectButton.addEventListener("click", () => {
      const cssCode = cssInput.value;
      if (cssCode.trim() !== "") {
        const existingCSS = document.querySelector(".redcss");
        if (document.querySelector(".redcss")) {
          document.body.removeChild(existingCSS);
        }
        const styleElement = document.createElement("style");
        container.className = "redcss";
        styleElement.textContent = cssCode;
        document.head.appendChild(styleElement);
        cssInput.value = "";
        redcord.storage.set(cssCode);
      }
    });
  
    // Append the input, inject button, and toggle button to the container
    container.appendChild(cssInput);
    container.appendChild(injectButton);
  
    // Append the container to the body
    document.body.appendChild(container);
  }
  createCssInjector();
  `;

  // Execute the JavaScript code in the main window's context
  mainWindow.webContents.executeJavaScript(dialogJS);
}

app.on('will-quit', () => {
  // Unregister the global shortcut when quitting the app
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
