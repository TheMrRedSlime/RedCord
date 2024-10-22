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
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      (function monitorDeletedMessages() {
        const messages = {};  // Store original messages
        const deletedMessagesSet = new Set();  // Set to store unique deleted messages
        const notificationQueue = [];  // Queue to hold deleted messages
        const notificationBar = document.createElement("div"); // Notification bar element

        // Set up the notification bar
        notificationBar.style.position = "fixed";
        notificationBar.style.top = "0";
        notificationBar.style.left = "0";
        notificationBar.style.width = "100%";
        notificationBar.style.backgroundColor = "#ff4d4d";  // Red background
        notificationBar.style.color = "white";
        notificationBar.style.padding = "10px";
        notificationBar.style.textAlign = "center";
        notificationBar.style.fontSize = "16px";
        notificationBar.style.zIndex = "1000";  // Ensure it's on top
        notificationBar.style.display = "none";  // Initially hidden
        document.body.appendChild(notificationBar);

        let currentUrl = location.href;  // Store the current URL

        // Function to show the most recent deleted message
        function showNextDeletedMessage() {
          if (notificationQueue.length > 0) {
            const messageContent = notificationQueue.shift(); // Get and remove the first message from the queue
            notificationBar.innerText = \`Deleted: \${messageContent}\`;
            notificationBar.style.display = "block";  // Show the bar
            
            // Hide the bar after 5 seconds
            setTimeout(() => {
              notificationBar.style.display = "none";  // Hide the bar after 5 seconds
              showNextDeletedMessage(); // Check for the next message in the queue
            }, 5000);
          }
        }

        // Main loop for monitoring messages
        function checkMessages() {
          // Check if the URL has changed
          if (location.href !== currentUrl) {
            // URL has changed, clear the stored messages
            console.log("Chat switched. Clearing stored messages.");
            Object.keys(messages).forEach(id => delete messages[id]);
            deletedMessagesSet.clear();
            notificationQueue.length = 0;  // Clear the notification queue
            currentUrl = location.href;  // Update current URL
          }

          // Select all list items with IDs that start with "chat-messages-"
          const messageElements = document.querySelectorAll("li[id^='chat-messages-']");

          // Loop through each message element and store its content
          messageElements.forEach((messageElem) => {
            const messageId = messageElem.id;  // Get the dynamic ID
            const messageContent = messageElem.innerText;  // Get the message content

            // Store the message content and its element in the messages object
            if (!messages[messageId]) {  // Only add new messages
              messages[messageId] = { content: messageContent, element: messageElem };
              console.log(\`Message logged: \${messageContent} (ID: \${messageId})\`);
            }
          });

          // Check for deleted messages
          for (const messageId in messages) {
            const messageObj = messages[messageId];

            // Check if the message element still exists in the DOM
            const elementExists = !!document.getElementById(messageId);
            
            // If the element doesn't exist and wasn't recorded as deleted
            if (!elementExists && !deletedMessagesSet.has(messageObj.content)) {
              // Add a brief timeout before registering the deletion to avoid false positives
              setTimeout(() => {
                if (!document.getElementById(messageId)) {  // Check again after the delay
                  // Message confirmed deleted
                  deletedMessagesSet.add(messageObj.content);  // Add to the deleted set
                  notificationQueue.push(messageObj.content);  // Add to the notification queue
                  
                  // Log the deleted message
                  console.log(\`Message deleted: \${messageObj.content} (ID: \${messageId})\`);

                  // Show the next deleted message if the bar is hidden
                  if (notificationBar.style.display === "none") {
                    showNextDeletedMessage();
                  }
                }
              }, 300);  // Wait 300 milliseconds before confirming deletion
            }
          }
        }

        // Start a loop that checks for messages every 2 seconds
        setInterval(checkMessages, 2000);  // Check every 2 seconds
      })();
    `);
  });
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
