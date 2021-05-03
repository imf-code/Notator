import { TextareaAutosize } from '@material-ui/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { INote } from './Interfaces';



interface INoteProps extends INote {
    /** Order index */
    index: number;
    /**
     * Edit handler
     * @param noteId ID of the note to be modified
     * @param name New text for the note
     */
    onEdit: (noteId: number, name: string) => Promise<void>;
    /**
     * Delete handler
     * @param noteId ID of the note to be deleted
     */
    onDelete: (noteId: number) => Promise<void>
    /** Whether the component is currently selected */
    selected: boolean;
    /** Handler for updating selected status */
    setSelected: (id: number) => void;
}

/** Component for displaying and manipulating a single note */
export default function Note(props: INoteProps) {

    const [edit, setEdit] = useState<boolean>(false);
    const [editedText, setEditedText] = useState<string>(props.text);
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const submitDisabledRef = useRef<boolean>(false);
    const deleteDisabledRef = useRef<boolean>(false);

    /**
     * Handle editing of text
     */
    function stopEdit() {
        setEdit(false);

        if (submitDisabledRef.current) return;
        else if (!editedText) {
            setEditedText(props.text);
            return;
        }
        else if (editedText === props.text) {
            return;
        }
        else {
            (async () => {
                submitDisabledRef.current = true;

                await props.onEdit(props.id, editedText);

                submitDisabledRef.current = false;
            })();
        }
    }

    const cancelEdit = useCallback(() => {
        setEdit(false);
        setEditedText(props.text);
        return;
    },
        [props.text]
    );

    useEffect(() => {
        if (props.selected) return;
        if (!props.selected && edit) cancelEdit();
        if (!props.selected && confirmDelete) setConfirmDelete(false);
        else return;
    },
        [props.selected, edit, confirmDelete, cancelEdit]
    );

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        else return;
    },
        [edit]
    );

    useEffect(() => {
        setEditedText(props.text);
    },
        [props.text]
    );

    function dragStyles(isDragging: boolean) {
        if (!isDragging) {
            return props.selected ? 'flex p-1 bg-green-100' :
                'flex py-1 px-1.5 hover:bg-green-300';
        }
        else {
            return 'flex p-1 bg-green-300 rounded-sm';
        }
    }

    return (
        <Draggable
            draggableId={String(props.id)}
            index={props.index}
            isDragDisabled={props.selected}>

            {(provided, snapshot) => (
                <form className={dragStyles(snapshot.isDragging)}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onSubmit={e => {
                        e.preventDefault();
                        stopEdit();
                    }}>

                    <div className={props.selected ? 'w-full bg-green-100 px-0.5' : 'w-full px-0.5'}>
                        {edit &&
                            <TextareaAutosize className='w-full align-middle border-none resize-none focus:outline-none bg-green-50'
                                ref={inputRef}
                                value={editedText} onChange={event => setEditedText(event.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        stopEdit();
                                    }
                                }} />}

                        {!edit &&
                            (props.selected ?
                                <div className='break-words'>
                                    {props.text}
                                </div> :
                                <div className='break-words hover:bg-green-300 hover:rounded-sm' onClick={() => props.setSelected(props.id)}>
                                    {props.text}
                                </div>)}

                        {(props.selected && !confirmDelete) &&
                            <div className='flex flex-row flex-grow justify-around w-full text-sm border-t-2 border-green-50'>

                                {edit ?
                                    <label>
                                        <input type='submit' hidden />
                                        <div className='underline cursor-pointer w-12 text-center'
                                            onMouseDown={() => {
                                                stopEdit();
                                            }}>
                                            Save
                                </div>
                                    </label> :
                                    <div className='underline cursor-pointer w-12 text-center'
                                        onClick={() => setEdit(true)}>
                                        Edit
                            </div>}

                                {edit ?
                                    <div className='underline cursor-pointer w-12 text-center'
                                        onClick={cancelEdit}>
                                        Cancel
                            </div> :
                                    <div className='underline cursor-pointer w-12 text-center'
                                        onClick={() => {
                                            setConfirmDelete(true);
                                        }}>
                                        Delete
                            </div>}

                                <div className='underline cursor-pointer w-12 text-center'
                                    onClick={() => {
                                        if (edit) cancelEdit();
                                        props.setSelected(props.id);
                                    }}>
                                    Close
                        </div>
                            </div>}

                        {(props.selected && confirmDelete) &&
                            <div className='flex flex-row justify-around w-full text-sm border-t-2 border-green-50'>
                                <div className='underline cursor-pointer w-12 text-center'
                                    onClick={() => {
                                        if (!deleteDisabledRef.current) {
                                            props.onDelete(props.id);
                                            return;
                                        }
                                        else return;
                                    }}>
                                    Yes
                        </div>

                                <div className='w-12 text-center'>
                                    Delete?
                        </div>

                                <div className='underline cursor-pointer w-12 text-center'
                                    onClick={() => {
                                        setConfirmDelete(false);
                                    }}>
                                    No
                            </div>
                            </div>}

                    </div>

                </form>
            )}

        </Draggable>
    );
}