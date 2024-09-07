/**
 * Bootstrap Theme Toggler
 *
 * You can easily switch between light and dark modes. 
 * The theme can be set automatically based on the system's preference and will remember the user's choice. 
 * Using Bootstrap's dropdown menu, users can select their preferred theme, and Bootstrap Icons can be included for an enhanced visual experience.
 *
 * @author Jindřich Ručil
 * @version 1.0.2
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
     * @constant {object} _ELEMENT_ID
     */
    static _ELEMENT_ID = 'bs-theme-toggler'; 

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
        }
    };

    /**
     * Helper function which prints info (console.log())
     * @param {Object} print_msg - The message to print to the console.
     * @param {Object} [optional_param] - Optional parameter to log along with the message.
     * @param {boolean} [error=false] - Whether to log as an error. If true, uses console.error; otherwise, uses console.log.
     * @static
     * @private
     */
    static _log(print_msg, optional_param, error = false) {
        const prefix = '[Bootstrap Theme Toggler v1.0.2]';
        
        if (this._ENABLE_LOGS) {
            !error 
                ? console.log(`${prefix} ${print_msg}`, optional_param !== undefined ? optional_param : ' ') 
                : console.error(`${prefix} ${print_msg}`, optional_param || "");
        }
    }

    /**
     * Generate RFC4122-compliant UUIDs.
     * @returns {string}
     * @static
     * @private
     */
    static _uuidv4() {
        try {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
                return (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
            });
        } catch (e) {
            this._log('Failed to generate UUID', e, true); 
            return '';  
        }
    }

    /**
     * Helper function which creates an HTMLElement object based on the specified 'type' and returns it.
     * @param {string} type - The type of HTML element to create (e.g., 'div', 'button', 'ul').
     * @returns {HTMLElement} - The created HTML element of the specified type.
     * @static
     * @private
     */
    static _createNode(type) {
        const el = document.createElement(type);
        if (type === 'button') {
            el.setAttribute('type', 'button');
        }
        return el;
    }

    /**
     * Creates a theme toggle dropdown and appends it to the given root element.
     * @param {HTMLElement} root - The root element to append the dropdown to.
     * @static
     */
    static _createDropdown(root) {

        this._log("Creating element..");
        
        this._integrity = this._uuidv4();
        this._log(`Generated ID: ${this._integrity}`);
        
        if (root.querySelector(`#${this._ELEMENT_ID}`)) {
            this._log("Element already exists in the root. Skipping creation..");
            return;
        }
    
        const dropdown = this._createNode('div');
        const dropdownClass = `dropdown ${this._config.classes.container || ''}`.trim();
        dropdown.className = dropdownClass;
        dropdown.id = this._ELEMENT_ID;
        dropdown.setAttribute('data-integrity', this._integrity);
        if ((this._config.classes.container)) {
            this._log(`Added custom class: '${this._config.classes.container}' to the dropdown container.`);
        }
        
        const button = this._createNode('button');
        const buttonClass = `dropdown-toggle btn border-0 ${this._config.classes.button || ''}`.trim();
        button.className = buttonClass;
        button.setAttribute('data-bs-toggle', 'dropdown');
        button.setAttribute('aria-expanded', 'false');
        if ((this._config.classes.button)) {
            this._log(`Added custom class: '${this._config.classes.button}' to the button.`);
        }
        
        const buttonIcon = this._createNode('i');
        buttonIcon.className = 'bi bi-circle-half';
        button.appendChild(buttonIcon);
        
        button.append(' ' + (this._config.i18n.system || 'System')); 
        
        const dropdownMenu = this._createNode('ul');
        const dropdownMenuClass = `dropdown-menu ${this._config.classes.menu || ''}`.trim();
        dropdownMenu.className = dropdownMenuClass;
        if ((this._config.classes.menu)) {
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
    }

    /**
     * Loads translations based on the configuration.
     * @param {string} lang - The language to load.
     * @returns {Promise<object>} - An object containing translations.
     * @static
     * @private
     */
    static async _loadTranslations(lang) {
        this._log(`Loading translations for language: ${lang}`);
        const translationsConfig = this._config.i18n.translations;

        if (typeof translationsConfig[lang] === 'string') {
            try {
                const response = await fetch(translationsConfig[lang]);
                if (response.ok) {
                    const translations = await response.json();
                    this._log(`Translations loaded successfully for language: ${lang}`);
                    return translations;
                } else {
                    this._log(`Failed to load translations from ${translationsConfig[lang]}`, null, true);
                }
            } catch (error) {
                this._log(`Error loading translations: ${error.message}`, null, true);
            }
        }

        this._log(`No external translations found for language: ${lang}. Using default.`);
        return translationsConfig[this._config.i18n.default] || {};
    }

    /**
     * Detects the language based on the autoDetect setting.
     * @returns {string} - The detected language.
     * @static
     * @private
     */
    static _detectLanguage() {
        const { autoDetect, default: defaultLang } = this._config.i18n;
        
        let detectedLang = defaultLang;

        if (autoDetect === 'browser') {
            detectedLang = navigator.language.split('-')[0] || defaultLang;
            this._log(`Detected language from browser: ${detectedLang}`);
        } else if (autoDetect === 'document') {
            detectedLang = document.documentElement.lang || defaultLang;
            this._log(`Detected language from document: ${detectedLang}`);
        } else {
            this._log(`Language auto-detection is disabled. Using default language: ${defaultLang}`);
        }
        
        return detectedLang;
    }

    /**
     * Updates the theme based on the provided value and saves it to localStorage.
     * @param {string} theme - The theme value ('system', 'light', or 'dark').
     * @static
     */
    static _updateTheme(theme) {
        this._log(`Updating theme to: ${theme}`);
    
        const toggler = document.getElementById(this._ELEMENT_ID);
    
        if (!toggler) {
            this._log(`Element with ID #${this._ELEMENT_ID} not found.`, null, true);
            return;
        }
    
        const dropdownItems = toggler.querySelectorAll(".dropdown-menu li a");
        dropdownItems.forEach(item => item.classList.remove("active"));
    
        const applyThemeSettings = (key, themeName, iconClass, text) => {
            document.documentElement.setAttribute("data-bs-theme", themeName);
            const button = toggler.querySelector(".dropdown-toggle");
            button.innerHTML = `<i class="${iconClass}"></i> ${text}`;
            localStorage.setItem(this._LOCAL_STORAGE_KEY, key);
    
            const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
            const capitalizedThemeName = capitalizeFirstLetter(themeName);
            this._log(`${capitalizedThemeName} theme applied.`);
    
            dropdownItems.forEach(item => {
                const itemValue = item.getAttribute('data-value');
                if (itemValue === 'system') {
                    item.textContent = this._config.i18n.translations.system || 'System';
                } else if (itemValue === 'light') {
                    item.textContent = this._config.i18n.translations.light || 'Light';
                } else if (itemValue === 'dark') {
                    item.textContent = this._config.i18n.translations.dark || 'Dark';
                }
            });
        };
    
        const selectedItem = toggler.querySelector(`.dropdown-menu li a[data-value="${theme}"]`);
        if (selectedItem) {
            selectedItem.classList.add("active");
        } else {
            this._log(`Theme option not found for: ${theme}`, null, true);
            return;
        }
    
        const i18n = this._config.i18n.translations;
        const translations = {
            system: i18n.system || 'System',
            light: i18n.light || 'Light',
            dark: i18n.dark || 'Dark'
        };
    
        switch (theme) {
            case "system":
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    this._log('Detected system preference: dark');
                    applyThemeSettings("system", "dark", "bi bi-circle-half", translations.system);
                } else {
                    this._log('Detected system preference: light');
                    applyThemeSettings("system", "light", "bi bi-circle-half", translations.system);
                }
                break;
    
            case "light":
                applyThemeSettings("light", "light", "bi bi-brightness-high-fill", translations.light);
                break;
    
            case "dark":
                applyThemeSettings("dark", "dark", "bi bi-moon-fill", translations.dark);
                break;
    
            default:
                this._log(`Unknown theme: ${theme}`, null, true);
                break;
        }
    }
    
    /**
     * Sets the language for translations and updates the UI accordingly.
     * @param {string} lang - The language code to set (e.g., 'it' for Italian).
     * @static
     */
    static async setLanguage(lang) {
        
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
    }

    /**
     * Initializes the theme toggler by creating the dropdown, setting the theme, 
     * and attaching event listeners for theme changes.
     * @param {Object} [options={}] - Optional settings for the theme toggler.
     * @static
     */
    static async run(options = {}) {

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
        this._log(`Detected language: ${detectedLanguage}`);
        const translations = await this._loadTranslations(detectedLanguage);
        this._config.i18n = { ...this._config.i18n, translations };
        
        let theme = localStorage.getItem(this._LOCAL_STORAGE_KEY);
        
        if (theme === null) {
            theme = "system";
            localStorage.setItem(this._LOCAL_STORAGE_KEY, "system");
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
    }

}
