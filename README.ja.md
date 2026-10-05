# FriendFolders

Discordのフレンドを、自分で作ったフォルダに分類できる [Vencord](https://vencord.dev) 用プラグインです。

## できること

- フレンド画面に「フォルダ」タブが追加されます。クリックでフォルダの切り替え・追加・名前変更・削除ができます。
- フレンドを右クリック →「フォルダに追加」。1人を複数のフォルダに入れられます。
- 分類はこのPC内(IndexedDB)にアカウントごとに保存され、再起動しても残ります。
- Discordのフレンド関係は一切変更せず、外部へのデータ送信もしません。

## インストール(Windows)

Vencordをソースからビルドする必要があります。コマンドはPowerShellに1行ずつ貼り付けてください。

**1. 必要なソフトを入れる(初回のみ)**

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

PowerShellを一度閉じて開き直してから:

```powershell
npm install -g pnpm
```

**2. Vencordを取得**

```powershell
cd $HOME
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install
```

**3. このプラグインを取得**

```powershell
git clone https://github.com/nekoshinajun/FriendFolders src/userplugins/FriendFolders
```

**4. ビルドしてDiscordに組み込む**

```powershell
pnpm build
pnpm inject
```

選択画面が出たら「Stable」を選んでEnter。`Success!` と出れば完了です。

**5. 有効化**

Discordを完全に終了(タスクトレイから終了)→ 起動 → ユーザー設定 → Vencord欄の「Plugins」→「FriendFolders」をON → 再起動

## よくあるつまずき

- **`Command "build" not found` と出る**  
  Vencordフォルダの外で実行しています。先に `cd $HOME\Vencord` を実行してください。左側が `...\Vencord>` になっていればOKです。

- **pnpmのバージョンについて黄色いWARNが出る**  
  無視して大丈夫です。

- **Discordのアップデート後にVencordが外れた**  
  `cd $HOME\Vencord` → `pnpm inject` をやり直してください。

## 更新方法

```powershell
cd $HOME\Vencord\src\userplugins\FriendFolders
git pull
cd $HOME\Vencord
pnpm build
```

その後Discordを再起動してください。

## 注意

- Vencordなどのクライアント改造はDiscordの利用規約上グレーな行為です。自己責任でご利用ください。
- この方法で入れたVencordは、アプリ内の自動更新が効きません。

## ライセンス

GPL-3.0-or-later(Vencordと同じ)