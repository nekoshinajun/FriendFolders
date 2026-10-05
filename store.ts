/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Data is stored only in IndexedDB (Vencord DataStore) and is never sent anywhere.

import * as DataStore from "@api/DataStore";
import { Logger } from "@utils/Logger";
import { useEffect, UserStore, useState } from "@webpack/common";

import { t } from "./i18n";

export const logger = new Logger("FriendFolders");

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
    order: number;
}

export interface FolderData {
    /** Bump and handle in migrate() when the shape changes */
    version: 1;
    folders: Folder[];
    /** friend user ID -> folder IDs */
    memberships: Record<string, string[]>;
}

const emptyData = (): FolderData => ({ version: 1, folders: [], memberships: {} });

let data: FolderData = emptyData();
let loadedForUser: string | null = null;
let selectedFolderId: string | null = null;

const listeners = new Set<() => void>();
let externalChangeHook: (() => void) | null = null;

export function setExternalChangeHook(fn: (() => void) | null) {
    externalChangeHook = fn;
}

function emit() {
    listeners.forEach(l => {
        try { l(); } catch (e) { logger.error("listener failed", e); }
    });
    externalChangeHook?.();
}

// Separate data per Discord account
function storageKey(userId: string) {
    return `FriendFolders_v1_${userId}`;
}

function migrate(raw: any): FolderData {
    if (!raw || typeof raw !== "object") return emptyData();
    const folders: Folder[] = Array.isArray(raw.folders)
        ? raw.folders.filter((f: any) => f && typeof f.id === "string" && typeof f.name === "string")
        : [];
    const ids = new Set(folders.map(f => f.id));
    const memberships: Record<string, string[]> = {};
    for (const [uid, fids] of Object.entries(raw.memberships ?? {})) {
        if (!Array.isArray(fids)) continue;
        const valid = (fids as unknown[]).filter((x): x is string => typeof x === "string" && ids.has(x));
        if (valid.length) memberships[uid] = [...new Set(valid)];
    }
    return { version: 1, folders, memberships };
}

export async function load() {
    const me = UserStore.getCurrentUser()?.id;
    if (!me) return;
    try {
        data = migrate(await DataStore.get(storageKey(me)));
    } catch (e) {
        logger.error("Failed to load folder data", e);
        data = emptyData();
    }
    loadedForUser = me;
    if (selectedFolderId && !getFolder(selectedFolderId)) selectedFolderId = null;
    emit();
}

async function save() {
    const me = loadedForUser;
    if (!me) {
        logger.warn("Data not loaded yet; skipping save");
        return;
    }
    try {
        await DataStore.set(storageKey(me), data);
    } catch (e) {
        logger.error("Failed to save folder data", e);
    }
}

function commit(next: FolderData) {
    data = next;
    emit();
    void save();
}

export const getFolders = () => [...data.folders].sort((a, b) => a.order - b.order);
export const getFolder = (id: string) => data.folders.find(f => f.id === id);
export const getUserFolderIds = (userId: string) => data.memberships[userId] ?? [];
export const isInFolder = (userId: string, folderId: string) => getUserFolderIds(userId).includes(folderId);
export const getMemberIds = (folderId: string) =>
    Object.keys(data.memberships).filter(uid => data.memberships[uid].includes(folderId));
export const isLoaded = () => loadedForUser != null;

export const getSelectedFolderId = () => selectedFolderId;
export function setSelectedFolderId(id: string | null) {
    selectedFolderId = id && getFolder(id) ? id : null;
    emit();
}

export const MAX_NAME_LENGTH = 32;

/** Returns an error message, or null if valid */
export function validateName(name: string, ignoreId?: string): string | null {
    const n = name.trim();
    if (!n) return t("errEmpty");
    if (n.length > MAX_NAME_LENGTH) return t("errTooLong", { max: MAX_NAME_LENGTH });
    if (data.folders.some(f => f.id !== ignoreId && f.name.toLowerCase() === n.toLowerCase()))
        return t("errDuplicate");
    return null;
}

export function createFolder(name: string): Folder {
    const folder: Folder = {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: Date.now(),
        order: data.folders.reduce((m, f) => Math.max(m, f.order), -1) + 1,
    };
    commit({ ...data, folders: [...data.folders, folder] });
    return folder;
}

export function renameFolder(id: string, name: string) {
    commit({ ...data, folders: data.folders.map(f => f.id === id ? { ...f, name: name.trim() } : f) });
}

export function deleteFolder(id: string) {
    const memberships: Record<string, string[]> = {};
    for (const [uid, fids] of Object.entries(data.memberships)) {
        const rest = fids.filter(f => f !== id);
        if (rest.length) memberships[uid] = rest;
    }
    if (selectedFolderId === id) selectedFolderId = null;
    commit({ ...data, folders: data.folders.filter(f => f.id !== id), memberships });
}

export function setMembership(userId: string, folderId: string, member: boolean) {
    if (!getFolder(folderId)) return;
    const current = getUserFolderIds(userId);
    const next = member
        ? [...new Set([...current, folderId])]
        : current.filter(f => f !== folderId);
    const memberships = { ...data.memberships };
    if (next.length) memberships[userId] = next;
    else delete memberships[userId];
    commit({ ...data, memberships });
}

export function useFolderStore() {
    const [, setTick] = useState(0);
    useEffect(() => {
        const l = () => setTick(t => t + 1);
        listeners.add(l);
        return () => void listeners.delete(l);
    }, []);
    return { folders: getFolders(), selectedFolderId };
}
