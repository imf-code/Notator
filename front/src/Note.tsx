import { useRef, useState } from 'react';
import { INote } from './Interfaces';

interface INoteProps extends INote {
    /** ID of the parent topic */
    topicId: number;
    /**
     * Function for handling editing of a note
     * @param topicId ID of the parent topic
     * @param noteId ID of the note to be modified
     * @param name New text for the note
     */
    onEdit: (topicId: number, noteId: number, name: string) => Promise<void>;
    /**
     * Function for deleting the note
     * @param topicId ID of the parent topic
     * @param noteId ID of the note to be deleted
     */
    onDelete: (topicId: number, noteId: number) => Promise<void>
}

/** Component for displaying and manipulating a single note. TODO: ADD, EDIT, MOVE, DELETE */
export default function Note(props: INoteProps) {

    const [edit, setEdit] = useState<boolean>(false);
    const [editedText, setEditedText] = useState<string>(props.text);

    const editRef = useRef<HTMLButtonElement>(null);

    /**
     * Handle editing of text
     */
    function onStopEdit() {
        if (!editedText) {
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
                if (editRef.current) editRef.current.disabled = true;

                await props.onEdit(props.topicId, props.id, editedText);

                if (editRef.current) editRef.current.disabled = false;
                setEdit(false);
            })();
        }
    }
    return (
        <div>
            {edit ?
                <span>
                    <input type='text' value={editedText} onChange={event => setEditedText(event.target.value)} />
                    <button onClick={onStopEdit} ref={editRef}>
                        {editedText === props.text || !editedText ? 'Cancel' : 'Save'}
                    </button>
                </span> :
                <span>
                    {props.text}
                    <button onClick={() => setEdit(true)}>
                        Edit
                    </button>
                </span>}

            <button onClick={() => props.onDelete(props.topicId, props.id)}>
                Delete
            </button>
        </div >
    )
}