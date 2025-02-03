export default class BootstrapThemeToggler {

    /**
     * @constant {boolean} _ENABLE_LOGS
     */
    static _ENABLE_LOGS = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    /**
     * @constant {string} _LOCAL_STORAGE_KEY
     */
    static _LOCAL_STORAGE_KEY = 'useTheme'; 

    /**
     * @constant {string} _ELEMENT_ID
     */
    static _ELEMENT_ID = this._uuidv4(); 

    /**
     * @constant {object} _config
     */
    static _config = {
        root: 'body', 
        prepend: false,
        i18n: { 
            default: 'en',
            autoDetect: false, // 'browser', 'document', false
            translations: {
                en: {
                    system: 'System',
                    light: 'Light',
                    dark: 'Dark'
                }
            }
        },
        classes: {
            container: '',
            button: '',
            menu: ''
        },
        storage: {
            type: 'local', // 'local' or 'session'
            expiration: null, // time in milliseconds as an integer or null for no expiration
        }
    };

    /**
     * Helper function which prints console.log/error
     * @param {Object} print - The message to print to the console.
     * @param {Object} [details] - Optional parameter to log along with the message.
     * @param {boolean} [error=false] - Whether to log as an error.
     * @static
     * @private
     */
    static _debug(print, details, error = false) {
        const prefix = '[Bootstrap Theme Toggler v1.1.1]';
        
        if (this._ENABLE_LOGS) {
            !error 
                ? console.log(`${prefix} ${print}`, details !== undefined ? details : ' ') 
                : console.error(`${prefix} ${print}`, details || "");
        }
    }

    /**
     * Generate RFC4122-compliant UUIDs.
     * @returns {string} RFC4122-compliant UUID.
     * @static
     * @private
     */
    static _uuidv4() {
        try {
            const uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
                return (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
            });
            return `_${uuid}`;
        } catch (error) {
            this._debug('Failed to generate UUID', error, true); 
            return '';  
        }
    }

    /**
     * Sets a value into storage (localStorage or sessionStorage) with optional expiration.
     * @param {string} key - The key for storage.
     * @param {string} value - The value to store.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _setStorage(key, value) {
        try {
            const storageType = this._config.storage.type === 'session' ? sessionStorage : localStorage;
            const expiration = this._config.storage.expiration;
            
            let data = {
                value,
                timestamp: expiration ? Date.now() : null
            };

            // Store data as plain JSON without encryption
            data = JSON.stringify(data);
            
            storageType.setItem(key, data);
        } catch (error) {
            this._debug('Error while storing value in storage', error, true);
        }
    }

    /**
     * Retrieves a value from storage and checks its expiration.
     * @param {string} key - The key to retrieve.
     * @returns {string|null} - The stored value or null if not found or expired.
     * @static
     * @private
     */
    static _getStorage(key) {
        try {
            const storageType = this._config.storage.type === 'session' ? sessionStorage : localStorage;
            const expiration = this._config.storage.expiration;
            
            let data = storageType.getItem(key);
            if (!data) return null;
            
            data = JSON.parse(data);

            // Check expiration
            if (expiration && Date.now() - data.timestamp > expiration) {
                storageType.removeItem(key);
                this._debug(`Item ${key} has expired.`);
                return null;
            }

            return data.value;
        } catch (error) {
            this._debug('Error retrieving value from storage', error, true);
            return null;
        }
    }

    /**
     * Creates an HTMLElement.
     * @param {string} type - The type of HTML element to create.
     * @returns {HTMLElement|null} - The created HTML element of the specified type.
     * @static
     * @private
     */
    static _createNode(type) {
        try {
            const el = document.createElement(type);
            if (type === 'button') {
                el.setAttribute('type', 'button');
            }
            return el;
        } catch (error) {
            this._debug('Failed to create HTML element', error, true);
            return null;
        }
    }

    /**
     * Creates a menu item.
     * @param {string} value - The value associated with the menu item.
     * @param {string} text - The text displayed for the menu item.
     * @param {string} [item] - Optional class to add to the <li> element.
     * @param {string} [link] - Optional class to add to the <a> link element.
     * @returns {HTMLElement} - The created <li> element with a corresponding <a> link.
     * @static
     * @private
     */
    static _createMenuItem(value, text, item = '', link = '') {
        const li = this._createNode('li');
        const a = this._createNode('a');
        
        if (item) {
            li.className = item.trim();
        }

        a.className = link.trim();
        a.href = '#!';
        a.setAttribute('data-value', value);

        a.append(text);
        li.appendChild(a);
        
        return li;
    }

    /**
     * Creates a theme toggle dropdown and appends it to the given root element.
     * @param {HTMLElement} root - The root element to append the dropdown to.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _createElement(root) {
        try {
            this._debug("Creating element..");
            
            this._id = this._uuidv4();
            this._debug(`Generated ID: ${this._id}`);
            
            if (root.querySelector(`#${this._ELEMENT_ID}`)) {
                this._debug("Element already exists in the root. Skipping creation..");
                return;
            }
        
            const dropdown = this._createNode('div');
            const dropdownClass = `dropdown ${this._config.classes.container || ''}`.trim();
            dropdown.className = dropdownClass;
            dropdown.id = this._ELEMENT_ID;
            if (this._config.classes.container) {
                this._debug(`Added custom class: '${this._config.classes.container}' to the dropdown container.`);
            }
            
            const button = this._createNode('button');
            const buttonClass = `dropdown-toggle btn border-0 ${this._config.classes.button || ''}`.trim();
            button.className = buttonClass;
            button.setAttribute('data-bs-toggle', 'dropdown');
            button.setAttribute('aria-expanded', 'false');
            if (this._config.classes.button) {
                this._debug(`Added custom class: '${this._config.classes.button}' to the button.`);
            }
            
            const buttonIcon = this._createNode('i');
            buttonIcon.className = 'bi bi-circle-half';
            button.appendChild(buttonIcon);
            
            button.append(' ' + (this._config.i18n.system || 'System')); 
            
            const dropdownMenu = this._createNode('ul');
            const dropdownMenuClass = `dropdown-menu ${this._config.classes.menu || ''}`.trim();
            dropdownMenu.className = dropdownMenuClass;
            if (this._config.classes.menu) {
                this._debug(`Added custom class: '${this._config.classes.menu}' to the dropdown menu.`);
            }
            
            dropdownMenu.appendChild(this._createMenuItem('system', this._config.i18n.system || 'System', '', 'dropdown-item'));
            dropdownMenu.appendChild(this._createMenuItem('light', this._config.i18n.light || 'Light', '', 'dropdown-item'));
            dropdownMenu.appendChild(this._createMenuItem('dark', this._config.i18n.dark || 'Dark', '', 'dropdown-item'));
            
            dropdown.appendChild(button);
            dropdown.appendChild(dropdownMenu);
            
            if (this._config.prepend) {
                root.insertAdjacentElement('afterbegin', dropdown); 
                this._debug("Prepended element to the root.");
            } else {
                root.appendChild(dropdown); 
                this._debug("Appended element to the root.");
            }

            const comment = document.createComment('BootstrapThemeToggler v1.1.1 | https://jindrichrucil.github.io');
            root.insertBefore(comment, root.firstChild);

        } catch (error) {
            this._debug('Error creating dropdown element', error, true);
        }
    }    

    /**
     * Applies the selected theme settings and updates the UI accordingly.
     * @param {string} key - The key for localStorage or sessionStorage.
     * @param {string} theme - The theme name.
     * @param {string} icon - The icon class for the theme.
     * @param {string} text - The display text for the theme.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _applyThemeSettings(key, theme, icon, text) {
        try {
            document.documentElement.setAttribute("data-bs-theme", theme);
    
            const toggler = document.getElementById(this._ELEMENT_ID);
            if (!toggler) throw new Error('Element with the specified ID not found.');
            
            const button = toggler.querySelector(".dropdown-toggle");
            if (!button) throw new Error('Dropdown toggle button not found.');
    
            button.innerHTML = `<i class="${icon}"></i> ${text}`;
            
            this._debug(`Theme ${theme} applied.`);

            this._setStorage(this._LOCAL_STORAGE_KEY, key);
        } catch (error) {
            this._debug('Failed to apply theme settings', error, true);
        }
    }

    /**
     * Updates the theme based on the provided value and saves it to storage.
     * @param {string} theme - The theme value.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _updateTheme(theme) {
        try {
            this._debug(`Updating theme to: ${theme}`);
            
            const toggler = document.getElementById(this._ELEMENT_ID);
            
            if (!toggler) {
                this._debug(`Element with ID #${this._ELEMENT_ID} not found.`, null, true);
                return;
            }
            
            const dropdownItems = toggler.querySelectorAll(".dropdown-menu li a");
            dropdownItems.forEach(item => item.classList.remove("active"));
            
            const selectedItem = toggler.querySelector(`.dropdown-menu li a[data-value="${theme}"]`);
            if (selectedItem) {
                selectedItem.classList.add("active");
            } else {
                this._debug(`Theme option not found for: ${theme}`, null, true);
                return;
            }
    
            switch (theme) {
                case "system":
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        this._debug('Detected system preference: dark');
                        this._applyThemeSettings("system", "dark", "bi bi-circle-half", this._config.i18n.translations.system || 'System');
                    } else {
                        this._debug('Detected system preference: light');
                        this._applyThemeSettings("system", "light", "bi bi-circle-half", this._config.i18n.translations.system || 'System');
                    }
                    break;
    
                case "light":
                    this._applyThemeSettings("light", "light", "bi bi-brightness-high-fill", this._config.i18n.translations.light || 'Light');
                    break;
    
                case "dark":
                    this._applyThemeSettings("dark", "dark", "bi bi-moon-fill", this._config.i18n.translations.dark || 'Dark');
                    break;
    
                default:
                    this._debug(`Unknown theme: ${theme}`, null, true);
                    break;
            }
        } catch (error) {
            this._debug('Error updating theme', error, true);
        }
    }  

    /**
     * Loads translations based on the configuration.
     * @param {string} lang - The language to load.
     * @returns {Promise<object>} - An object containing translations.
     * @static
     * @private
     */
    static async _loadTranslations(lang) {
        try {
            this._debug(`Loading translations for language: ${lang}`);
            const translationsConfig = this._config.i18n.translations;

            if (typeof translationsConfig[lang] === 'string') {
                const response = await fetch(translationsConfig[lang]);
                if (response.ok) {
                    const translations = await response.json();
                    this._debug(`Translations loaded successfully for language: ${lang}`);
                    return translations;
                } else {
                    this._debug(`Failed to load translations from ${translationsConfig[lang]}`, null, true);
                }
            }

            if (translationsConfig[lang]) {
                this._debug(`Translations found in config for language: ${lang}`);
                return translationsConfig[lang];
            } else {
                this._debug(`No translations found for language: ${lang}. Using default config.`);
                return translationsConfig[this._config.i18n.default] || {};
            }
        } catch (error) {
            this._debug('Error loading translations', error, true);
            return this._config.i18n.translations[this._config.i18n.default] || {};
        }
    }

    /**
     * Detects the language based on the autoDetect setting.
     * @returns {string} - The detected language.
     * @static
     * @private
     */
    static _detectLanguage() {
        try {
            const { autoDetect, default: defaultLang } = this._config.i18n;
            
            let detectedLang = defaultLang;
    
            if (autoDetect === 'browser') {
                detectedLang = navigator.language.split('-')[0] || defaultLang;
                this._debug(`Detected language from browser: ${detectedLang}`);
            } else if (autoDetect === 'document') {
                detectedLang = document.documentElement.lang || defaultLang;
                this._debug(`Detected language from document: ${detectedLang}`);
            } else {
                this._debug(`Language auto-detection is disabled. Used default language: ${defaultLang}`);
            }
            
            return detectedLang;
        } catch (error) {
            this._debug('Failed to detect language', error, true);
            return this._config.i18n.default;
        }
    }  

    /**
     * Sets the language for translations and updates the UI accordingly.
     * @param {string} lang - The language code to set.
     * @returns {Promise<void>} This method does not return a value but returns a promise.
     * @static
     */
    static async setLanguage(lang) {
        try {
            this._debug(`Setting language to: ${lang}`);
            
            const translations = await this._loadTranslations(lang);
            
            this._config.i18n.translations = translations;
            
            const dropdown = document.getElementById(this._ELEMENT_ID);
            if (dropdown) {
                const dropdownItems = dropdown.querySelectorAll(".dropdown-menu li a");
                dropdownItems.forEach(item => {
                    const itemValue = item.getAttribute('data-value');
                    if (itemValue === 'system') {
                        item.textContent = translations.system || 'System';
                    } else if (itemValue === 'light') {
                        item.textContent = translations.light || 'Light';
                    } else if (itemValue === 'dark') {
                        item.textContent = translations.dark || 'Dark';
                    }
                });
                
                const button = dropdown.querySelector(".dropdown-toggle");
                if (button) {
                    button.innerHTML = `<i class="${button.querySelector('i').className}"></i> ${translations.system || 'System'}`;
                }
            }
            
            this._debug(`Language updated to: ${lang}`);
        } catch (error) {
            this._debug('Error setting language', error, true);
        }
    }    

    /**
     * Initializes the theme toggler.
     * @param {Object} [options={}] - Optional settings.
     * @returns {Promise<void>} This method does not return a value but returns a promise.
     * @static
     */
    static async run(options = {}) {
        try {
            this._config = { ...this._config, ...options };
            
            this._debug("Initializing..");
            
            let root;
            if (typeof this._config.root === 'string') {
                root = document.querySelector(this._config.root);
            } else if (this._config.root instanceof HTMLElement) {
                root = this._config.root;
            } else {
                root = document.body;
            }

            if (!root) {
                this._debug("Root element not found. Falling back to body.", null, true);
                root = document.body;
            }
            
            this._createElement(root);
            
            const detectedLanguage = this._detectLanguage();
            const translations = await this._loadTranslations(detectedLanguage);
            this._config.i18n = { ...this._config.i18n, translations };
            
            let theme = this._getStorage(this._LOCAL_STORAGE_KEY);
            
            if (theme === null) {
                theme = "system";
                this._setStorage(this._LOCAL_STORAGE_KEY, "system");
                this._debug("No saved theme found. Defaulting to: system");
            } else {
                this._debug(`Saved theme found: ${theme}`);
            }
            
            this._updateTheme(theme);
            
            document.body.addEventListener("click", event => {
                if (event.target.matches(`#${this._ELEMENT_ID} .dropdown-menu li a`)) {
                    const selectedValue = event.target.getAttribute("data-value");
                    this._updateTheme(selectedValue);
                }
            });
            
            this._debug("Initialized!");
        } catch (error) {
            this._debug('Error during initialization', error, true);
        }
    }
}
