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

/** Component for displaying and manipulating a single note */
export default function Note(props: INoteProps) {

    const [edit, setEdit] = useState<boolean>(false);
    const [editedText, setEditedText] = useState<string>(props.text);

    const submitRef = useRef<HTMLInputElement>(null);
    const deleteRef = useRef<HTMLButtonElement>(null);

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
                if (submitRef.current) submitRef.current.disabled = true;

                await props.onEdit(props.id, editedText);

                if (submitRef.current) submitRef.current.disabled = false;
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
        <form className='flex justify-between my-1'
            onSubmit={e => {
                e.preventDefault();
                onStopEdit();
            }}>

            <div>
                {edit ?
                    <button onClick={onCancelEdit}
                        className='focus:outline-none'>
                        <CancelIcon fontSize='small' className={iconStyle} />
                    </button> :
                    <button ref={deleteRef} className='focus:outline-none disabled:opacity-50'
                        onClick={() => {
                            if (deleteRef.current && !deleteRef.current.disabled) {
                                deleteRef.current.disabled = true;
                                props.onDelete(props.id);
                                return;
                            }
                            else return;
                        }}>
                        <DeleteIcon fontSize='small' className={iconStyle} />
                    </button>}

                {edit ?
                    <label>
                        <input type='submit' hidden />
                        <SaveAltIcon fontSize='small' className={iconStyle} />
                    </label> :
                    <button onClick={() => setEdit(true)}
                        className='focus:outline-none'>
                        <EditIcon fontSize='small' className={iconStyle} />
                    </button>}
            </div>

            <div className='w-5/6'>
                {edit ?
                    <input className='w-full align-middle px-1 -mt-1 -mx-1 focus:outline-none rounded-sm shadow-inner bg-green-100'
                        type='text' value={editedText} onChange={event => setEditedText(event.target.value)} /> :
                    <p className='hover:bg-green-400 cursor-pointer'>
                        {props.text}
                    </p>}
            </div>

        </form>
    )
}