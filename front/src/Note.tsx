import { useCallback, useEffect, useRef, useState } from 'react';
import { INote } from './Interfaces';

interface INoteProps extends INote {
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

    const inputRef = useRef<HTMLInputElement>(null);
    const submitDisabledRef = useRef<boolean>(false);
    const deleteDisabledRef = useRef<boolean>(false);

    /**
     * Handle editing of text
     */
    function stopEdit() {
        if (submitDisabledRef.current) return;
        else if (!editedText) {
            setEditedText(props.text);
            setEdit(false);
            return;
        }
        else if (editedText === props.text) {
            setEdit(false);
            return;
        }
        else {
            (async () => {

                submitDisabledRef.current = true;

                await props.onEdit(props.id, editedText);

                submitDisabledRef.current = false;

                setEdit(false);
                props.setSelected(props.id);
            })();
        }
    }

    const cancelEdit = useCallback(() => {
        setEditedText(props.text);
        setEdit(false);
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

    return (
        <form className='flex my-1 mr-1'
            onSubmit={e => {
                e.preventDefault();
                stopEdit();
            }}>

            <div className={props.selected ? 'w-full bg-green-200 rounded-sm px-0.5' : 'w-full px-0.5'}>
                {edit &&
                    <input className='w-full align-middle px-1 -mt-1 -mx-1 focus:outline-none rounded-sm bg-green-200'
                        ref={inputRef}
                        type='text' value={editedText} onChange={event => setEditedText(event.target.value)} />}

                {!edit &&
                    (props.selected ?
                        <div className=''>
                            {props.text}
                        </div> :
                        <p className='hover:bg-green-300 hover:rounded-sm' onClick={() => props.setSelected(props.id)}>
                            {props.text}
                        </p>)}

                {(props.selected && !confirmDelete) &&
                    <div className='flex flex-row flex-grow justify-around w-full text-sm border-t-2 border-green-100'>

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
                    <div className='flex flex-row justify-around w-full text-sm border-t-2 border-green-100'>
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
                            Delete
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
    )
}