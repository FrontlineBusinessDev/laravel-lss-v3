/**
 * @file components/settings/index.ts
 * Shared primitives for the settings list tables — a single import surface so
 * every module page composes the same header, row shell, cells, and menu.
 */

export { SettingsListHeader } from './SettingsListHeader';
export { SettingsRow, TextCell } from './SettingsRow';
export { buildRecordMenu } from './recordMenu';
export { AddRecordButton } from './AddRecordButton';
