/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import definePlugin from "@utils/types";
import { Constants, FriendsStore, RelationshipStore } from "@webpack/common";

import { FolderTabLabel, getHeaderText, UserContextMenuPatch } from "./components";
import { getSelectedFolderId, isInFolder, load, logger, setExternalChangeHook } from "./store";

const SECTION = "FRIEND_FOLDERS";

// The friends list reads rows via FriendsStore.getState().rows.filter(section, query).
// For our section, reuse the ALL result and narrow it to the selected folder.

let rowsProto: any = null;
let originalFilter: ((section: string, query?: string | null) => any[]) | null = null;

function wrapRowsFilter() {
    if (originalFilter) return true;
    const rows = FriendsStore?.getState?.()?.rows;
    const proto = rows && Object.getPrototypeOf(rows);
    if (!proto || typeof proto.filter !== "function") return false;

    const orig = proto.filter;
    proto.filter = function (this: any, section: string, query?: string | null) {
        if (section !== SECTION) return orig.call(this, section, query);
        const all: any[] = orig.call(this, Constants.FriendsSections?.ALL ?? "ALL", query);
        const folderId = getSelectedFolderId();
        return folderId ? all.filter(row => isInFolder(row.userId, folderId)) : all;
    };
    rowsProto = proto;
    originalFilter = orig;
    return true;
}

function unwrapRowsFilter() {
    if (rowsProto && originalFilter) rowsProto.filter = originalFilter;
    rowsProto = originalFilter = null;
}

// Local re-render only; no API requests
function refreshFriendsList() {
    try {
        FriendsStore.emitChange();
        RelationshipStore.emitChange();
    } catch (e) {
        logger.error("Failed to refresh friends list", e);
    }
}

export default definePlugin({
    name: "FriendFolders",
    description: "Organize your friends into custom folders and filter the friends list by folder. Data is stored locally only.",
    authors: [{ name: "nekoshina", id: 0n }],
    tags: ["Friends", "Organisation"],

    patches: [
        // Add the folder tab to the friends page header
        {
            find: "#{intl::FRIENDS_SECTION_ONLINE}),className:",
            replacement: {
                match: /,{id:(\i\.\i)\.PENDING,show:.+?className:(\i\.\i)(?=\},\{id:)/,
                replace: (rest, sections, className) =>
                    `,{id:${sections}.${SECTION},show:true,className:${className},content:$self.renderTabLabel()}${rest}`
            }
        },
        // List header text ("<folder> — N")
        {
            find: "#{intl::FRIENDS_ALL_HEADER}",
            replacement: {
                match: /toString\(\)\}\);case (\i\.\i)\.(\i):/,
                replace: `toString()});case $1.${SECTION}:return $self.getHeaderText(arguments[1]);case $1.$2:`
            }
        },
        // Empty state throws on unknown sections; reuse ONLINE's
        {
            find: "FriendsEmptyState: Invalid empty state",
            replacement: {
                match: /case (\i\.\i)\.ONLINE:(?=(?:case \i\.\i\.\i:)*return \i\.SECTION_ONLINE)/,
                replace: `case $1.ONLINE:case $1.${SECTION}:`
            }
        }
    ],

    contextMenus: {
        "user-context": UserContextMenuPatch
    },

    flux: {
        // Reload data on login / account switch
        CONNECTION_OPEN() {
            void load();
        }
    },

    renderTabLabel() {
        wrapRowsFilter();
        return <FolderTabLabel />;
    },

    getHeaderText,

    async start() {
        Constants.FriendsSections[SECTION] = SECTION;
        setExternalChangeHook(refreshFriendsList);
        if (!wrapRowsFilter()) logger.info("FriendsStore rows not ready yet; will wrap lazily");
        await load();
    },

    stop() {
        setExternalChangeHook(null);
        unwrapRowsFilter();
        delete Constants.FriendsSections[SECTION];
        refreshFriendsList();
    }
});
