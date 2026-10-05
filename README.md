# FriendFolders

**Discordのフレンドを、好きなフォルダに整理できるVencord用プラグインです。**

> [!IMPORTANT]
> ## 🚀 Windows かんたんインストール
>
> **ファイルを手動でダウンロードする必要はありません。**
>
> ### 1. PowerShellを開く
> Windowsの検索で **PowerShell** と入力し、**Windows PowerShell** を開きます。  
> 管理者として開く必要はありません。
>
> ### 2. 下の1行をコピー
>
> ```powershell
> irm https://raw.githubusercontent.com/nekoshinajun/FriendFolders/main/install.ps1 | iex
> ```
>
> コード右上の **コピーボタン** を押せばOKです。
>
> ### 3. PowerShellに貼り付けて Enter
> 必要なデータを自動でダウンロードし、FriendFoldersをセットアップします。
>
> ### 4. Vencordの選択画面が出たら Stable を選択
> 通常版Discordを使っている場合は **Stable** を選んで **Enter** を押します。
>
> ### 5. インストール完了後、もう一度 Enter
> **`Press Enter to close:`** と表示されたら、もう一度 **Enter** を押してPowerShellを閉じます。
>
> ### 6. Discordを完全終了して再起動
> **ユーザー設定 → Vencord → Plugins → FriendFolders** をONにしたら完了です。
>
> **更新するときも、同じ1行をもう一度実行するだけです。**

---

## できること

- フレンド画面に「フォルダ」タブを追加
- フレンドを右クリックして好きなフォルダへ追加
- 「仕事」「VTuber」「ゲーム友達」など自由に分類
- 1人を複数のフォルダに登録可能
- フォルダごとにフレンドを絞り込み
- フォルダ情報はPC内（IndexedDB）に保存

## 使い方

1. Discordのフレンド一覧で相手を右クリック
2. **フォルダに追加** を選択
3. 既存フォルダを選ぶか、新しいフォルダを作成
4. フレンド画面上部の **「フォルダ」**（「全て表示」の右側）から表示・切り替え

**「フォルダ」は、Discordの「フレンド」画面上部にある「オンライン」「全て表示」と同じ並びに追加されます。**

## 注意事項

FriendFoldersはDiscord公式機能ではなく、Vencord用の非公式プラグインです。Vencordなどのクライアント改造はDiscordの利用規約に抵触する可能性があります。利用はご自身の判断でお願いします。

Windows Smart App Controlを無効にする必要はありません。現在、未署名EXE版インストーラーは一般配布していません。

## 手動インストール（上級者向け）

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

## English

English instructions: [README.en.md](README.en.md)

## ライセンス

GPL-3.0-or-later
