const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

const filePath = 'redcss.json';

contextBridge.exposeInMainWorld('redcord', {
  // ... (other properties)
  storage: {
    get: () => {
      try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(rawData);
      } catch (error) {
        console.error('Error reading data:', error);
        return null;
      }
    },
    set: (css) => {
      try {
        // Remove all existing style elements with the ID "redcss"
        const styleElements = document.querySelectorAll('style#redcss');
        styleElements.forEach((element) => {
          element.remove();
        });

        // Create and append the new style element with the ID "redcss"
        const styleElement = document.createElement("style");
        styleElement.id = "redcss";
        styleElement.textContent = css;
        document.head.appendChild(styleElement);

        // Store the CSS data
        fs.writeFileSync(filePath, JSON.stringify({ css }), 'utf8');
      } catch (error) {
        console.error('Error writing data:', error);
      }
    },
  },
});