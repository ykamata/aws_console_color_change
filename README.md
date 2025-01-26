# AWS Console Color Changer

This Chrome extension customizes the header and footer background colors of the AWS Management Console based on the logged-in account.

## Features

- Dynamically changes header and footer background colors based on the active AWS account.
- Manage account-color mappings through an easy-to-use popup interface.
- Automatically applies styles when the AWS console tab becomes active.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/aws-console-color-changer.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click on **Load unpacked** and select the project folder.

## Usage

1. Open the AWS Management Console in a Chrome tab.
2. Click the extension icon to open the popup.
3. Add an account ID and a background color in the popup interface.
4. The header and footer of the AWS console will automatically reflect the configured color based on the account ID.

## Directory Structure

```bash
aws-console-color-changer/
├── manifest.json              # Chrome extension configuration file
├── background.js              # Background script to manage tab activation
├── content.js                 # Script to dynamically change colors in AWS console
├── popup.html                 # HTML for popup interface
├── popup.js                   # JavaScript for popup functionality
├── icons/                     # Folder containing extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── styles/                    # Folder for additional styles (optional)
│   └── popup.css              # Popup-specific CSS (if needed)
├── README.md                  # Project documentation
└── .gitignore                 # Files and directories to ignore in Git
```

## Notes

- Account IDs can be entered with or without hyphens; the extension will normalize them internally.
- Background colors must be specified in the `#RRGGBB` format.
- Ensure the required permissions are granted when loading the extension in Chrome.

## License

This project is licensed under the [MIT License](LICENSE).
