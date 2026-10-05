# FriendFolders

A [Vencord](https://vencord.dev) userplugin for organizing Discord friends into custom folders.

## Features

- Adds a folder tab to the Friends page
- Add friends to folders from the user context menu
- A friend can belong to multiple folders
- Data stays local in IndexedDB
- Does not modify Discord relationships or transmit folder data externally

## Install (Windows)

> **A public EXE installer is not currently distributed.**
> Unsigned executables can be blocked by Windows Smart App Control. You do not need to disable Smart App Control.

### Easy install

Open PowerShell and run:

```powershell
irm https://raw.githubusercontent.com/nekoshinajun/FriendFolders/main/install.ps1 | iex
```

Follow the prompts. The script prepares Git, Node.js, pnpm, the Vencord source tree, FriendFolders, and builds Vencord.

When Vencord asks for a target, choose **Stable**. Restart Discord, then enable **FriendFolders** in Settings → Vencord → Plugins.

### Manual install

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
npm install -g pnpm
cd $HOME
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install
git clone https://github.com/nekoshinajun/FriendFolders src/userplugins/friendFolders
pnpm build
pnpm inject
```

## Updating

Run the Easy install command again. It updates the source and rebuilds Vencord.

## Notes

- Vencord custom plugins require building Vencord from source.
- Client mods are not an official Discord feature; use them at your own discretion.
- Disabling Smart App Control is not recommended.
- A GUI installer may return later if a trusted code-signing path is available.

## License

GPL-3.0-or-later.
