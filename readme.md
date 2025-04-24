Highlighter is a Visual Studio Code extension that allows you to search for any custom regular expression pattern in .txt and .json files, highlight all occurrences in the editor, and view a count of matches. By default, it searches for the word "Dude" (case-insensitive), but you can easily change the search pattern in the extension settings.



Features:

Search & Highlight: Right-click on a .txt or .json file (in Explorer or the open editor) and select Highlight Matches to highlight all occurrences in-place and display the number of matches found.

Results in New Tab: Choose Find Matches + New Tab to open a new editor tab listing every match along with a header showing the total count.

Configurable Regex: Easily customize the search pattern via VS Code settings under Highlighter Settings.

Logging: Optionally log all matches to the Debug Console for troubleshooting or analysis.



Installation:

1. Package the Extension into a VSIX

Make sure you have vsce installed:

npm install -g vsce

From your extension project root, run:

vsce package

This will generate a file named highlighter-<version>.vsix.

2. Install the VSIX

Open VS Code.

Go to the Extensions view (Ctrl+Shift+X / Cmd+Shift+X).

Click the ⋮ menu (⋯) in the top right and select Install from VSIX....

Choose the generated highlighter-<version>.vsix file.

After installation, reload the window if prompted.

3. (Optional) Global Installation via CLI

You can install the VSIX globally so that it’s available in any workspace:

code --install-extension highlighter-<version>.vsix



Usage:


Highlight in Editor

In the Explorer or an open .txt/.json file, right-click and select Highlight Matches. All matches will be decorated in red, and an information message will display the match count.


Open Results in New Tab

Right-click and choose Find Matches + New Tab. A new read-only editor tab will open with a header Found X matches: followed by all the matching strings on separate lines.



Configuration:


Open VS Code Settings (Ctrl+, / Cmd+,) and search for Highlighter:

Highlighter › Regex (highlighter.regex)

Default: \bDude\b

A JavaScript-compatible regular expression (without the gi flags). Matches are global and case-insensitive by default.

Highlighter › Log Matches (highlighter.logMatches)

Default: true

When enabled, all found matches are printed to the Debug Console.



⚠️ After changing settings, run Developer: Reload Window to apply the new defaults.

Updating the VSIX

Whenever you make changes to the extension code or settings:

Bump the version in package.json (e.g., 1.0.3 → 1.0.4).

Run vsce package again to generate an updated VSIX.

Reinstall the VSIX (via the UI or code --install-extension).

Reload the window to pick up changes.



License

This project is licensed under the MIT License.