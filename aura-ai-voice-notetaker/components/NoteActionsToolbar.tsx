import React from 'react';
import { SaveIcon, PencilIcon, DownloadIcon, RocketIcon, ShareIcon, DuplicateIcon } from './icons';

const ToolbarButton = ({ icon: Icon, label, onClick, disabled = false, showSpinner = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200 p-1 text-xs"
        aria-label={label}
    >
        {showSpinner ? (
             <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin"></div>
            </div>
        ) : (
            <Icon className="w-5 h-5 mb-1" />
        )}
        <span>{label}</span>
    </button>
);


export const NoteActionsToolbar = ({
    isDirty,
    isEditing,
    isSaving,
    onSave,
    onEditToggle,
    onDownload,
    onReanalyze,
    onShare,
    onDuplicate
}) => {
    return (
        <div className="flex-shrink-0 bg-gray-900 md:bg-transparent px-4 py-2 md:px-0 md:py-0">
            <div className="flex items-center justify-end md:justify-start space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium transition-opacity duration-300 ${isDirty ? 'opacity-100 text-yellow-400' : 'opacity-0'}`}>
                        Unsaved
                    </span>
                    <ToolbarButton icon={SaveIcon} label="Save" onClick={onSave} disabled={!isDirty || isSaving} showSpinner={isSaving} />
                </div>
                <ToolbarButton icon={PencilIcon} label={isEditing ? 'View' : 'Edit'} onClick={onEditToggle} />
                <ToolbarButton icon={DownloadIcon} label="Download" onClick={onDownload} />
                <div className="hidden md:flex items-center space-x-6">
                    <ToolbarButton icon={RocketIcon} label="Re-analyze" onClick={onReanalyze} disabled={isSaving} showSpinner={isSaving} />
                    <ToolbarButton icon={ShareIcon} label="Share" onClick={onShare} />
                    <ToolbarButton icon={DuplicateIcon} label="Duplicate" onClick={onDuplicate} />
                </div>
            </div>
        </div>
    );
};
