(function () {
  'use strict';

  const defaults = { language: 'en', theme: 'dark' };
  let storage;

  function isStorageSecurityError(error) {
    return error && error.name === 'SecurityError';
  }

  try {
    storage = window.localStorage;
  } catch (error) {
    if (!isStorageSecurityError(error)) throw error;
  }

  function read(key, validValues) {
    if (!storage) return null;

    try {
      const value = storage.getItem(key);
      return validValues.includes(value) ? value : null;
    } catch (error) {
      if (!isStorageSecurityError(error)) throw error;
      storage = null;
      return null;
    }
  }

  function write(key, value) {
    if (!storage) return false;

    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      if (!isStorageSecurityError(error)) throw error;
      storage = null;
      return false;
    }
  }

  let language = read('siteLanguage', ['en', 'es']) || defaults.language;
  let theme = read('siteTheme', ['light', 'dark']) || defaults.theme;

  function apply() {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
  }

  function notify() {
    window.dispatchEvent(new CustomEvent('sitepreferenceschange', {
      detail: { language, theme }
    }));
  }

  const preferences = {
    getLanguage() {
      return language;
    },
    getTheme() {
      return theme;
    },
    setLanguage(value) {
      if (!['en', 'es'].includes(value)) return false;
      language = value;
      apply();
      return write('siteLanguage', value);
    },
    setTheme(value) {
      if (!['light', 'dark'].includes(value)) return false;
      theme = value;
      apply();
      return write('siteTheme', value);
    }
  };

  apply();
  window.SitePreferences = preferences;

  window.addEventListener('storage', function (event) {
    if (event.key === 'siteLanguage') {
      language = ['en', 'es'].includes(event.newValue)
        ? event.newValue
        : defaults.language;
    } else if (event.key === 'siteTheme') {
      theme = ['light', 'dark'].includes(event.newValue)
        ? event.newValue
        : defaults.theme;
    } else if (event.key === null) {
      language = defaults.language;
      theme = defaults.theme;
    } else {
      return;
    }

    apply();
    notify();
  });
})();
