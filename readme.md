# Bootstrap Theme Toggler

You can easily switch between light and dark modes. 
The theme can be set automatically based on the system's preference and will remember the user's choice. 
Using Bootstrap's dropdown menu, users can select their preferred theme, and Bootstrap Icons can be included for an enhanced visual experience.

# How to use

### 1. Include the Required Files
Make sure to include Bootstrap CSS, JS, and Bootstrap Theme Toggler JS in your project.

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script type="module" src="dist/js/bootstrap-theme-toggler.min.js"></script>

<!-- Optionally -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
```

### 2. Initialize the Bootstrap
After including the required files, simply call the following JavaScript function to enable the theme toggler functionality:

```javascript
BootstrapThemeToggler.run();
```

### 3. Optional Configuration
You can customize the toggler using the following parameters:

```javascript
BootstrapThemeToggler.run({
    root: '#theme-toggler-container', 
    i18n: {
        default: 'en', 
        translations: {
            cs: {
                system: 'Systém',
                light: 'Světlý',
                dark: 'Tmavý'
            }
        }
    },
    classes: {
        container: 'custom-container-class',
        button: 'custom-button-class',
        menu: 'custom-menu-class'
    },
    storage: {
        type: 'local', 
        expiration: 3600000,
        encryption: {
            enabled: true,
            method: 'base64' 
        }
    }
});
```

## Website

Check out the https://ruciloss.github.io

## License

Distributed under the **MIT** License. See [LICENSE](https://ruciloss.github.io/license/mit) for more information.

## Credits

Copyright © Ruciloss
