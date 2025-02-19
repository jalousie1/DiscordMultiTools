const fs = require('fs');
const path = require('path');

const settingsDir = path.resolve(__dirname, '../accounts');
const mainSettingsPath = path.resolve(__dirname, '../settings.json');

// Ensure accounts directory exists
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
}

const defaultAccountSettings = {
  whitelist: [],
  whiteListServers: [],
  trigger: '',
  stateRPC: true
};

const defaultSettings = {
  accounts: [],
  currentAccount: null
};

const getAccountSettingsPath = (username) => {
  return path.join(settingsDir, `${username}.json`);
};

const loadAccountSettings = (username) => {
  const accountPath = getAccountSettingsPath(username);
  try {
    if (fs.existsSync(accountPath)) {
      const fileData = fs.readFileSync(accountPath, 'utf8');
      return { ...defaultAccountSettings, ...JSON.parse(fileData) };
    }
  } catch (err) {
    console.log('     [!] Erro ao carregar configurações da conta');
  }
  return defaultAccountSettings;
};

const saveAccountSettings = (username, settings) => {
  const accountPath = getAccountSettingsPath(username);
  try {
    fs.writeFileSync(accountPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.log('     [!] Erro ao salvar configurações da conta');
    return false;
  }
};

const loadSettings = () => {
  try {
    if (fs.existsSync(mainSettingsPath)) {
      const fileData = fs.readFileSync(mainSettingsPath, 'utf8');
      const settings = { ...defaultSettings, ...JSON.parse(fileData) };
      // Ensure whitelist exists
      if (!settings.whitelist) {
        settings.whitelist = [];
      }
      return settings;
    }
  } catch (err) {
    console.log('     [!] Erro ao carregar configurações principais');
  }
  return { ...defaultSettings, whitelist: [] };
};

const saveSettings = (settings) => {
  const { accounts, currentAccount } = settings;
  const mainSettings = { accounts, currentAccount };
  fs.writeFileSync(mainSettingsPath, JSON.stringify(mainSettings, null, 2));
};

module.exports = {
  loadSettings,
  saveSettings,
  loadAccountSettings,
  saveAccountSettings,
  defaultAccountSettings
};
