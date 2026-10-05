/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import ErrorBoundary from "@components/ErrorBoundary";
import { classNameFactory } from "@utils/css";
import type { RenderModalProps, User } from "@vencord/discord-types";
import { ConfirmModal, ContextMenuApi, FluxDispatcher, Forms, Menu, Modal, openModal, RelationshipStore, TextInput, useState } from "@webpack/common";

import { t } from "./i18n";
import {
    createFolder, deleteFolder, getFolder, getMemberIds, getSelectedFolderId, getUserFolderIds,
    MAX_NAME_LENGTH, renameFolder, setMembership, setSelectedFolderId, useFolderStore, validateName
} from "./store";

export const cl = classNameFactory("vc-friend-folders-");

const friendCount = (folderId: string) => getMemberIds(folderId).filter(id => RelationshipStore.isFriend(id)).length;

function FolderNameModal({ modalProps, folderId, onCreated }: {
    modalProps: RenderModalProps;
    folderId?: string;
    onCreated?(id: string): void;
}) {
    const existing = folderId ? getFolder(folderId) : undefined;
    const [name, setName] = useState(existing?.name ?? "");
    const [error, setError] = useState<string | null>(null);

    const submit = () => {
        const err = validateName(name, folderId);
        if (err) return setError(err);
        if (existing) renameFolder(existing.id, name);
        else onCreated?.(createFolder(name).id);
        modalProps.onClose();
    };

    return (
        <Modal
            {...modalProps}
            title={existing ? t("renameTitle") : t("createTitle")}
            actions={[{
                text: existing ? t("save") : t("create"),
                variant: "primary",
                onClick: submit,
                disabled: !name.trim()
            }]}
        >
            <form className={cl("modal-form")} onSubmit={e => { e.preventDefault(); submit(); }}>
                <Forms.FormTitle>{t("folderName")}</Forms.FormTitle>
                <TextInput
                    value={name}
                    placeholder={t("placeholder")}
                    maxLength={MAX_NAME_LENGTH}
                    autoFocus
                    onChange={(v: string) => { setName(v); setError(null); }}
                />
                {error && <Forms.FormText className={cl("modal-error")}>{error}</Forms.FormText>}
            </form>
        </Modal>
    );
}

export function openCreateFolderModal(onCreated?: (id: string) => void) {
    openModal(props => <FolderNameModal modalProps={props} onCreated={onCreated} />);
}

export function openRenameFolderModal(folderId: string) {
    openModal(props => <FolderNameModal modalProps={props} folderId={folderId} />);
}

export function openDeleteFolderModal(folderId: string) {
    const folder = getFolder(folderId);
    if (!folder) return;
    openModal(props => (
        <ConfirmModal
            {...props}
            title={t("deleteTitle", { name: folder.name })}
            subtitle={t("deleteBody")}
            confirmText={t("delete")}
            cancelText={t("cancel")}
            variant="critical"
            onConfirm={() => deleteFolder(folderId)}
        />
    ));
}

function FolderPickerMenu() {
    const { folders, selectedFolderId } = useFolderStore();

    return (
        <Menu.Menu
            navId="vc-friend-folders-picker"
            onClose={() => FluxDispatcher.dispatch({ type: "CONTEXT_MENU_CLOSE" })}
            aria-label={t("tabLabel")}
        >
            <Menu.MenuGroup>
                <Menu.MenuRadioItem
                    id="vc-ff-all"
                    group="vc-ff-folder"
                    label={t("allFriends")}
                    checked={selectedFolderId == null}
                    action={() => setSelectedFolderId(null)}
                />
            </Menu.MenuGroup>
            {folders.length > 0 && (
                <Menu.MenuGroup>
                    {folders.map(f => (
                        <Menu.MenuRadioItem
                            key={f.id}
                            id={`vc-ff-folder-${f.id}`}
                            group="vc-ff-folder"
                            label={`${f.name} (${friendCount(f.id)})`}
                            checked={selectedFolderId === f.id}
                            action={() => setSelectedFolderId(f.id)}
                        />
                    ))}
                </Menu.MenuGroup>
            )}
            <Menu.MenuGroup>
                <Menu.MenuItem
                    id="vc-ff-create"
                    label={t("addFolder")}
                    color="brand"
                    action={() => openCreateFolderModal(id => setSelectedFolderId(id))}
                />
                {folders.length > 0 && (
                    <Menu.MenuItem id="vc-ff-manage" label={t("editFolders")}>
                        {folders.map(f => (
                            <Menu.MenuItem key={f.id} id={`vc-ff-manage-${f.id}`} label={f.name}>
                                <Menu.MenuItem
                                    id={`vc-ff-rename-${f.id}`}
                                    label={t("rename")}
                                    action={() => openRenameFolderModal(f.id)}
                                />
                                <Menu.MenuItem
                                    id={`vc-ff-delete-${f.id}`}
                                    label={t("delete")}
                                    color="danger"
                                    action={() => openDeleteFolderModal(f.id)}
                                />
                            </Menu.MenuItem>
                        ))}
                    </Menu.MenuItem>
                )}
            </Menu.MenuGroup>
        </Menu.Menu>
    );
}

function FolderIcon() {
    return (
        <svg className={cl("icon")} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M2 6a3 3 0 0 1 3-3h4.17a3 3 0 0 1 2.12.88L12.4 5H19a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6Z" />
        </svg>
    );
}

function Chevron() {
    return (
        <svg className={cl("chevron")} width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M5.3 9.3a1 1 0 0 1 1.4 0L12 14.58l5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
        </svg>
    );
}

export const FolderTabLabel = ErrorBoundary.wrap(function FolderTabLabel() {
    const { selectedFolderId } = useFolderStore();
    const name = selectedFolderId ? getFolder(selectedFolderId)?.name : null;

    const open = (e: React.MouseEvent) => {
        // Let the click propagate so Discord still selects the tab
        ContextMenuApi.openContextMenu(e as any, () => <FolderPickerMenu />);
    };

    return (
        <span
            className={cl("tab")}
            onClick={open}
            onContextMenu={e => { e.preventDefault(); open(e); }}
        >
            <FolderIcon />
            <span className={cl("tab-label")}>{name ?? t("tabLabel")}</span>
            <Chevron />
        </span>
    );
}, { noop: true });

export function getHeaderText(count: number) {
    const id = getSelectedFolderId();
    const name = id ? getFolder(id)?.name : null;
    return `${name ?? t("allFriends")} — ${count}`;
}

export const UserContextMenuPatch: NavContextMenuPatchCallback = (children, { user }: { user?: User; }) => {
    // Hook must run before any early return
    const { folders } = useFolderStore();
    if (!user || !RelationshipStore.isFriend(user.id)) return;

    const memberOf = getUserFolderIds(user.id);

    children.push(
        <Menu.MenuGroup>
            <Menu.MenuItem id="vc-ff-add-to-folder" label={t("addToFolder")}>
                {folders.length > 0 && (
                    <Menu.MenuGroup>
                        {folders.map(f => (
                            <Menu.MenuCheckboxItem
                                key={f.id}
                                id={`vc-ff-member-${f.id}`}
                                label={f.name}
                                checked={memberOf.includes(f.id)}
                                action={() => setMembership(user.id, f.id, !memberOf.includes(f.id))}
                            />
                        ))}
                    </Menu.MenuGroup>
                )}
                <Menu.MenuGroup>
                    <Menu.MenuItem
                        id="vc-ff-new-folder-for-user"
                        label={t("newFolder")}
                        color="brand"
                        action={() => openCreateFolderModal(id => setMembership(user.id, id, true))}
                    />
                </Menu.MenuGroup>
            </Menu.MenuItem>
        </Menu.MenuGroup>
    );
};
