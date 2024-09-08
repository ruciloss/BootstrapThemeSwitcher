/**
 * Bootstrap Theme Toggler
 *
 * You can easily switch between light and dark modes. 
 * The theme can be set automatically based on the system's preference and will remember the user's choice. 
 * Using Bootstrap's dropdown menu, users can select their preferred theme, and Bootstrap Icons can be included for an enhanced visual experience.
 *
 * @author Jindřich Ručil
 * @version 1.1.0
 * @license MIT
 * @see {@link https://jindrichrucil.github.io}
 * 
 * @requires Bootstrap 5.2 or later
 */
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
            encryption: {
                enabled: true, 
                method: 'xor' // 'base64', 'hex', 'XOR'
            }
        }
    };

    /**
     * Helper function which prints console.log/error
     * @param {Object} print_msg - The message to print to the console.
     * @param {Object} [optional_param] - Optional parameter to log along with the message.
     * @param {boolean} [error=false] - Whether to log as an error.
     * @static
     * @private
     */
    static _log(print_msg, optional_param, error = false) {
        const prefix = '[Bootstrap Theme Toggler v1.1.0]';
        
        if (this._ENABLE_LOGS) {
            !error 
                ? console.log(`${prefix} ${print_msg}`, optional_param !== undefined ? optional_param : ' ') 
                : console.error(`${prefix} ${print_msg}`, optional_param || "");
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
            this._log('Failed to create HTML element', error, true);
            return null;
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
            this._log(`Loading translations for language: ${lang}`);
            const translationsConfig = this._config.i18n.translations;

            if (typeof translationsConfig[lang] === 'string') {
                const response = await fetch(translationsConfig[lang]);
                if (response.ok) {
                    const translations = await response.json();
                    this._log(`Translations loaded successfully for language: ${lang}`);
                    return translations;
                } else {
                    this._log(`Failed to load translations from ${translationsConfig[lang]}`, null, true);
                }
            }

            // Check if translations for the given language exist in the config
            if (translationsConfig[lang]) {
                this._log(`Translations found in config for language: ${lang}`);
                return translationsConfig[lang];
            } else {
                this._log(`No translations found for language: ${lang}. Using default config.`);
                return translationsConfig[this._config.i18n.default] || {};
            }
        } catch (error) {
            this._log('Error loading translations', error, true);
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
                this._log(`Detected language from browser: ${detectedLang}`);
            } else if (autoDetect === 'document') {
                detectedLang = document.documentElement.lang || defaultLang;
                this._log(`Detected language from document: ${detectedLang}`);
            } else {
                this._log(`Language auto-detection is disabled. Used default language: ${defaultLang}`);
            }
            
            return detectedLang;
        } catch (error) {
            this._log('Failed to detect language', error, true);
            return this._config.i18n.default;
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
            this._log('Failed to generate UUID', error, true); 
            return '';  
        }
    }

    /**
     * Encodes data using Base64.
     * @param {string} data - Data to encode.
     * @returns {string} - Encoded data.
     * @static
     * @private
     */
    static _encodeBase64(data) {
        try {
            return btoa(data);
        } catch (error) {
            this._log('Failed to encode data using Base64', error, true);
            return data;
        }
    }

    /**
     * Decodes data from Base64.
     * @param {string} data - Data to decode.
     * @returns {string} - Decoded data.
     * @static
     * @private
     */
    static _decodeBase64(data) {
        try {
            return atob(data);
        } catch (error) {
            this._log('Failed to decode data using Base64', error, true);
            return data;
        }
    }

    /**
     * Encrypts data using XOR.
     * @param {string} data - Data to encrypt.
     * @param {string} key - Key for XOR operation.
     * @returns {string} - Encrypted data.
     * @static
     * @private
     */
    static _xorEncrypt(data, key) {
        try {
            let keyBytes = new TextEncoder().encode(key);
            let dataBytes = new TextEncoder().encode(data);
            let encryptedBytes = new Uint8Array(dataBytes.length);
            for (let i = 0; i < dataBytes.length; i++) {
                encryptedBytes[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
            }
            return Array.from(encryptedBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            this._log('Failed to encrypt data using XOR', error, true);
            return data;
        }
    }

    /**
     * Encodes data using Hex.
     * @param {string} data - Data to encode.
     * @returns {string} - Encoded data.
     * @static
     * @private
     */
    static _encodeHex(data) {
        try {
            return Array.from(new Uint8Array(new TextEncoder().encode(data)))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        } catch (error) {
            this._log('Failed to encode data using Hex', error, true);
            return data;
        }
    }

    /**
     * Decodes data from Hex.
     * @param {string} data - Data to decode.
     * @returns {string} - Decoded data.
     * @static
     * @private
     */
    static _decodeHex(data) {
        try {
            let bytes = new Uint8Array(data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            return new TextDecoder().decode(bytes);
        } catch (error) {
            this._log('Failed to decode data using Hex', error, true);
            return data;
        }
    }

    /**
     * Decrypts data using XOR.
     * @param {string} data - Data to decrypt.
     * @param {string} key - Key for XOR operation.
     * @returns {string} - Decrypted data.
     * @static
     * @private
     */
    static _xorDecrypt(data, key) {
        try {
            let keyBytes = new TextEncoder().encode(key);
            let encryptedBytes = new Uint8Array(data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            let decryptedBytes = new Uint8Array(encryptedBytes.length);
            for (let i = 0; i < encryptedBytes.length; i++) {
                decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
            }
            return new TextDecoder().decode(decryptedBytes);
        } catch (error) {
            this._log('Failed to decrypt data using XOR', error, true);
            return data;
        }
    }

    /**
     * Sets a value into storage (localStorage or sessionStorage) with optional expiration and encryption.
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
            
            if (this._config.storage.encryption.enabled) {
                if (this._config.storage.encryption.method === 'hex') {
                    data = this._encodeHex(JSON.stringify(data));
                    this._log(`Saved key: ${key} in ${this._config.storage.type}Storage with hex encryption: ${data}`);
                } else if (this._config.storage.encryption.method === 'xor') {
                    data = this._xorEncrypt(JSON.stringify(data), this._config.storage.encryption.key);
                    this._log(`Saved key: ${key} in ${this._config.storage.type}Storage with XOR encryption: ${data}`);
                } else if (this._config.storage.encryption.method === 'base64') {
                    data = this._encodeBase64(JSON.stringify(data));
                    this._log(`Saved key: ${key} in ${this._config.storage.type}Storage with base64 encryption: ${data}`);
                }
            } else {
                data = JSON.stringify(data);
            }
    
            storageType.setItem(key, data);
        } catch (error) {
            this._log('Error while storing value in storage', error, true);
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
            
            if (this._config.storage.encryption.enabled) {
                if (this._config.storage.encryption.method === 'hex') {
                    data = JSON.parse(this._decodeHex(data));
                    this._log(`Retrieved and decrypted key: ${key} from ${this._config.storage.type}Storage with hex`);
                } else if (this._config.storage.encryption.method === 'xor') {
                    data = JSON.parse(this._xorDecrypt(data, this._config.storage.encryption.key));
                    this._log(`Retrieved and decrypted key: ${key} from ${this._config.storage.type}Storage with XOR`);
                } else if (this._config.storage.encryption.method === 'base64') {
                    data = JSON.parse(this._decodeBase64(data));
                    this._log(`Retrieved and decrypted key: ${key} from ${this._config.storage.type}Storage with base64`);
                }
            } else {
                data = JSON.parse(data);
            }
    
            if (expiration && Date.now() - data.timestamp > expiration) {
                storageType.removeItem(key);
                this._log(`Item ${key} has expired.`);
                return null;
            }

            return data.value;
        } catch (error) {
            this._log('Error retrieving value from storage', error, true);
            return null;
        }
    }

    /**
     * Applies the selected theme settings and updates the UI accordingly.
     * @param {string} key - The key for localStorage or sessionStorage.
     * @param {string} themeName - The theme name.
     * @param {string} iconClass - The icon class for the theme.
     * @param {string} text - The display text for the theme.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _applyThemeSettings(key, themeName, iconClass, text) {
        try {
            document.documentElement.setAttribute("data-bs-theme", themeName);
    
            const toggler = document.getElementById(this._ELEMENT_ID);
            if (!toggler) throw new Error('Element with the specified ID not found.');
            
            const button = toggler.querySelector(".dropdown-toggle");
            if (!button) throw new Error('Dropdown toggle button not found.');
    
            button.innerHTML = `<i class="${iconClass}"></i> ${text}`;
            
            this._log(`Theme ${themeName} applied.`);

            this._setStorage(this._LOCAL_STORAGE_KEY, key);
        } catch (error) {
            this._log('Failed to apply theme settings', error, true);
        }
    }
    
    /**
     * Creates a theme toggle dropdown and appends it to the given root element.
     * @param {HTMLElement} root - The root element to append the dropdown to.
     * @returns {void} This method does not return a value.
     * @static
     * @private
     */
    static _createDropdown(root) {
        try {
            this._log("Creating element..");
            
            this._id = this._uuidv4();
            this._log(`Generated ID: ${this._id}`);
            
            if (root.querySelector(`#${this._ELEMENT_ID}`)) {
                this._log("Element already exists in the root. Skipping creation..");
                return;
            }
        
            const dropdown = this._createNode('div');
            const dropdownClass = `dropdown ${this._config.classes.container || ''}`.trim();
            dropdown.className = dropdownClass;
            dropdown.id = this._ELEMENT_ID;
            if (this._config.classes.container) {
                this._log(`Added custom class: '${this._config.classes.container}' to the dropdown container.`);
            }
            
            const button = this._createNode('button');
            const buttonClass = `dropdown-toggle btn border-0 ${this._config.classes.button || ''}`.trim();
            button.className = buttonClass;
            button.setAttribute('data-bs-toggle', 'dropdown');
            button.setAttribute('aria-expanded', 'false');
            if (this._config.classes.button) {
                this._log(`Added custom class: '${this._config.classes.button}' to the button.`);
            }
            
            const buttonIcon = this._createNode('i');
            buttonIcon.className = 'bi bi-circle-half';
            button.appendChild(buttonIcon);
            
            button.append(' ' + (this._config.i18n.system || 'System')); 
            
            const dropdownMenu = this._createNode('ul');
            const dropdownMenuClass = `dropdown-menu ${this._config.classes.menu || ''}`.trim();
            dropdownMenu.className = dropdownMenuClass;
            if (this._config.classes.menu) {
                this._log(`Added custom class: '${this._config.classes.menu}' to the dropdown menu.`);
            }
            
            const createMenuItem = (value, text) => {
                const item = this._createNode('li');
                const link = this._createNode('a');
                link.className = 'dropdown-item';
                link.href = '#!';
                link.setAttribute('data-value', value);
            
                link.append(text);
            
                item.appendChild(link);
                return item;
            };
            
            dropdownMenu.appendChild(createMenuItem('system', this._config.i18n.system || 'System'));
            dropdownMenu.appendChild(createMenuItem('light', this._config.i18n.light || 'Light'));
            dropdownMenu.appendChild(createMenuItem('dark', this._config.i18n.dark || 'Dark'));
            
            dropdown.appendChild(button);
            dropdown.appendChild(dropdownMenu);
            
            if (this._config.prepend) {
                root.insertAdjacentElement('afterbegin', dropdown); 
                this._log("Prepended element to the root.");
            } else {
                root.appendChild(dropdown); 
                this._log("Appended element to the root.");
            }

            const comment = document.createComment(' BootstrapThemeToggler v1.1.0 | https://jindrichrucil.github.io ');
            root.insertBefore(comment, root.firstChild);

        } catch (error) {
            this._log('Error creating dropdown element', error, true);
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
            this._log(`Updating theme to: ${theme}`);
            
            const toggler = document.getElementById(this._ELEMENT_ID);
            
            if (!toggler) {
                this._log(`Element with ID #${this._ELEMENT_ID} not found.`, null, true);
                return;
            }
            
            const dropdownItems = toggler.querySelectorAll(".dropdown-menu li a");
            dropdownItems.forEach(item => item.classList.remove("active"));
            
            const selectedItem = toggler.querySelector(`.dropdown-menu li a[data-value="${theme}"]`);
            if (selectedItem) {
                selectedItem.classList.add("active");
            } else {
                this._log(`Theme option not found for: ${theme}`, null, true);
                return;
            }
    
            switch (theme) {
                case "system":
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        this._log('Detected system preference: dark');
                        this._applyThemeSettings("system", "dark", "bi bi-circle-half", this._config.i18n.translations.system || 'System');
                    } else {
                        this._log('Detected system preference: light');
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
                    this._log(`Unknown theme: ${theme}`, null, true);
                    break;
            }
        } catch (error) {
            this._log('Error updating theme', error, true);
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
            this._log(`Setting language to: ${lang}`);
            
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
            
            this._log(`Language updated to: ${lang}`);
        } catch (error) {
            this._log('Error setting language', error, true);
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
            
            this._log("Initializing..");
            
            let root;
            if (typeof this._config.root === 'string') {
                root = document.querySelector(this._config.root);
            } else if (this._config.root instanceof HTMLElement) {
                root = this._config.root;
            } else {
                root = document.body;
            }

            if (!root) {
                this._log("Root element not found. Falling back to body.", null, true);
                root = document.body;
            }
            
            this._createDropdown(root);
            
            const detectedLanguage = this._detectLanguage();
            const translations = await this._loadTranslations(detectedLanguage);
            this._config.i18n = { ...this._config.i18n, translations };
            
            let theme = this._getStorage(this._LOCAL_STORAGE_KEY);
            
            if (theme === null) {
                theme = "system";
                this._setStorage(this._LOCAL_STORAGE_KEY, "system");
                this._log("No saved theme found. Defaulting to: system");
            } else {
                this._log(`Saved theme found: ${theme}`);
            }
            
            this._updateTheme(theme);
            
            document.body.addEventListener("click", event => {
                if (event.target.matches(`#${this._ELEMENT_ID} .dropdown-menu li a`)) {
                    const selectedValue = event.target.getAttribute("data-value");
                    this._updateTheme(selectedValue);
                }
            });
            
            this._log("Initialized!");
        } catch (error) {
            this._log('Error during initialization', error, true);
        }
    }
}
