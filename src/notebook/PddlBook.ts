/* --------------------------------------------------------------------------------------------
 * Copyright (c) Jan Dolejsi 2021. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
import { CellKind, EventEmitter, ExtensionContext, notebook, NotebookContentProvider, NotebookData, NotebookDocumentBackup, NotebookDocumentEditEvent, NotebookDocumentOpenContext, Uri, workspace } from 'vscode';

const providerOptions = {
	transientMetadata: {
		runnable: true,
		editable: true,
		custom: true,
	},
	transientOutputs: true
};

export class PddlBook {
    constructor(context: ExtensionContext) {
        context.subscriptions.push(
            notebook.registerNotebookContentProvider(
                'pddl-notebook',
                new PddlBookProvider(),
                providerOptions
            )
        );

        context.subscriptions.push(
            notebook.onDidOpenNotebookDocument(doc => {
                console.log(doc);
            })
        );
    }
}

class PddlBookProvider implements NotebookContentProvider {
    
    async openNotebook(uri: Uri, openContext: NotebookDocumentOpenContext): Promise<NotebookData> {
        console.log(openContext);

        const content = JSON.parse((await workspace.fs.readFile(uri)).toString()) as NotebookSchema;
        return {
            languages: [],
            metadata: { custom: content.metadata },
            cells: content.cells.map(cell => {
                if (cell.cell_type === 'markdown') {
                    return {
                        cellKind: CellKind.Markdown,
                        source: cell.source,
                        language: 'markdown',
                        outputs: [],
                        metadata: {}
                    };
                } else if (cell.cell_type === 'code') {
                    return {
                        cellKind: CellKind.Code,
                        source: cell.source,
                        language: content.metadata?.language_info?.name || 'pddl',
                        outputs: [
                            /* not implemented */
                        ],
                        metadata: {}
                    };
                } else {
                    console.error('Unexpected cell:', cell);
                    throw new Error('Unexpected cell: ' + cell.cell_type);
                }
            })
        };
    }

    // The following are dummy implementations not relevant to this example.
    onDidChangeNotebook = new EventEmitter<NotebookDocumentEditEvent>().event;
    async resolveNotebook(): Promise<void> {
        console.log('Not implemented');
    }
    async saveNotebook(): Promise<void> {
        console.log('Not implemented');
    }
    async saveNotebookAs(): Promise<void> {
        console.log('Not implemented');
    }
    async backupNotebook(): Promise<NotebookDocumentBackup> {
        return {
            id: '', delete: (): void => {
                console.log('Not implemented');
            }
        };
    }
}

interface NotebookSchema {
    cells: NotebookCellSchema[];
    metadata?: NotebookMetadataSchema;
}

interface NotebookCellSchema {
    cell_type: string;
    source: string;
}

interface NotebookMetadataSchema {
    language_info?: NotebookMetadataLanguageInfoSchema;
}

interface NotebookMetadataLanguageInfoSchema {
    name: string; 
}