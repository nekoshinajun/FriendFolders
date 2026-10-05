# FriendFolders

A [Vencord](https://vencord.dev) userplugin that lets you organize your Discord friends into custom folders.

[日本語版はこちら](README.ja.md)

## Features

- Adds a **Folders** tab to the Friends page. Click it to switch folders, create, rename, or delete them.
- Right-click a friend → **Add to Folder**. A friend can belong to multiple folders.
- Folder data is saved locally (IndexedDB) per Discord account and survives restarts.
- Never touches your actual Discord friends, and sends no data anywhere.
- UI follows your Discord language (Japanese / English).

## Installation

This is a userplugin, so you need to build Vencord from source.
See the [official guide](https://docs.vencord.dev/installing/) for details.

1. Install [Node.js](https://nodejs.org) (LTS) and [Git](https://git-scm.com), then run `npm install -g pnpm`
2. Clone and set up Vencord:
   ```sh
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   pnpm install
   ```
3. Clone this plugin into `src/userplugins`:
   ```sh
   git clone https://github.com/<your-name>/FriendFolders src/userplugins/FriendFolders
   ```
4. Build and inject:
   ```sh
   pnpm build
   pnpm inject
   ```
5. Restart Discord, open **Settings → Vencord → Plugins**, enable **FriendFolders**, and restart again.

## Updating

```sh
cd Vencord/src/userplugins/FriendFolders
git pull
cd ../../..
pnpm build
```

Then restart Discord.

## Known limitations

- The folder view shows online and offline friends together.
- Folder assignments of removed friends are kept, and come back if you re-add them.
- Discord updates may break the patches. If the tab disappears, please open an issue.

## License

GPL-3.0-or-later, same as Vencord.
