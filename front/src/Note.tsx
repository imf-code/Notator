import { useRef, useState } from 'react';
import { INote } from './Interfaces';
import { iconStyle } from './Buttons.Icons';

// Icons
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';


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

                await props.onEdit(props.id, editedText);

                if (editRef.current) editRef.current.disabled = false;
                setEdit(false);
            })();
        }
    }

    function onCancelEdit() {
        setEditedText(props.text);
        setEdit(false);
        return;
    }

    return (
        <div className='flex justify-between my-1'>
            <div className='w-5/6'>
                {edit ?
                    <input type='text' value={editedText} onChange={event => setEditedText(event.target.value)} /> :
                    <p className='truncate'>
                        {props.text}
                    </p>}
            </div>

            <div>
                {edit ?
                    <button onClick={onStopEdit} ref={editRef}
                        className='focus:outline-none'>
                        <SaveAltIcon fontSize='small' className={iconStyle} />
                    </button> :
                    <button onClick={() => setEdit(true)}
                        className='focus:outline-none'>
                        <EditIcon fontSize='small' className={iconStyle} />
                    </button>}
                {edit ?
                    <button onClick={onCancelEdit}
                        className='focus:outline-none'>
                        <CancelIcon fontSize='small' className={iconStyle} />
                    </button> :
                    <button onClick={() => props.onDelete(props.id)}
                        className='focus:outline-none'>
                        <DeleteIcon fontSize='small' className={iconStyle} />
                    </button>}
            </div>
        </div>
    )
}