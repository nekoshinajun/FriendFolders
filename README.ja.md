# FriendFolders

Discordのフレンドを、自分で作ったフォルダに分類できる [Vencord](https://vencord.dev) 用プラグインです。

## できること

- フレンド画面に「フォルダ」タブを追加
- フレンドを右クリックしてフォルダへ追加
- 1人を複数フォルダへ登録可能
- データはこのPC内（IndexedDB）だけに保存
- Discordのフレンド関係を変更せず、外部送信もしません

## インストール（Windows）

> **現在、一般配布用EXEは提供していません。**
> 未署名EXEがWindows Smart App Controlにブロックされる環境があるためです。Smart App Controlを無効にする必要はありません。

### かんたん手順

1. PowerShellを開く
2. 下の1行をコピーして貼り付け、Enter

```powershell
irm https://raw.githubusercontent.com/nekoshinajun/FriendFolders/main/install.ps1 | iex
```

あとは画面の案内に従ってください。必要なGit / Node.js / pnpm、Vencordソース、FriendFoldersの取得とビルドを自動で行います。

Vencordの選択画面が出たら **Stable** を選んでEnterしてください。完了後、Discordを完全終了して起動し、**ユーザー設定 → Vencord → Plugins → FriendFolders** をONにしてください。

### 手動で入れたい場合

Vencordをソースからビルドする必要があります。

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

## 更新

同じ「かんたん手順」の1行をもう一度実行すれば、FriendFoldersとVencordを更新して再ビルドします。

## 注意

- Vencordのcustom pluginはVencordをソースからビルドする必要があります。
- Vencordなどのクライアント改造はDiscordの公式機能ではありません。自己責任で利用してください。
- Smart App Controlを無効にすることは推奨していません。
- 将来、信頼されたコード署名を導入できた場合はGUIインストーラーの一般配布を検討します。

## ライセンス

GPL-3.0-or-later（Vencordと同じ）
