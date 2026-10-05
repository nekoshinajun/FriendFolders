/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LocaleStore } from "@webpack/common";

const en = {
    tabLabel: "Folders",
    allFriends: "All Friends",
    addFolder: "Add Folder",
    editFolders: "Edit Folders",
    rename: "Rename",
    delete: "Delete",
    addToFolder: "Add to Folder",
    newFolder: "New Folder",
    createTitle: "Create Folder",
    renameTitle: "Rename Folder",
    create: "Create",
    save: "Save",
    cancel: "Cancel",
    folderName: "Folder Name",
    placeholder: "e.g. Work",
    deleteTitle: "Delete \"{name}\"?",
    deleteBody: "Only the folder and its assignments are removed. Your Discord friends are not affected.",
    errEmpty: "Enter a folder name.",
    errTooLong: "Folder names can be up to {max} characters.",
    errDuplicate: "A folder with this name already exists.",
};

const ja: typeof en = {
    tabLabel: "フォルダ",
    allFriends: "すべてのフレンド",
    addFolder: "フォルダを追加",
    editFolders: "フォルダを編集",
    rename: "名前を変更",
    delete: "削除",
    addToFolder: "フォルダに追加",
    newFolder: "新しいフォルダ",
    createTitle: "フォルダを作成",
    renameTitle: "フォルダ名を変更",
    create: "作成",
    save: "保存",
    cancel: "キャンセル",
    folderName: "フォルダ名",
    placeholder: "例: 仕事",
    deleteTitle: "「{name}」を削除しますか？",
    deleteBody: "フォルダと分類情報だけが削除されます。Discordのフレンド関係には影響しません。",
    errEmpty: "フォルダ名を入力してください。",
    errTooLong: "フォルダ名は{max}文字以内にしてください。",
    errDuplicate: "同じ名前のフォルダがすでにあります。",
};

export function t(key: keyof typeof en, params: Record<string, string | number> = {}) {
    const dict = LocaleStore?.locale?.startsWith("ja") ? ja : en;
    return dict[key].replace(/\{(\w+)\}/g, (m, k) => String(params[k] ?? m));
}
