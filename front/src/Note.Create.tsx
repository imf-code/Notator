import { useRef, useState } from "react";
import { iconStyle } from './Buttons.Icons';

// Icons
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

interface ICreateNoteProps {
    /** ID of the parent topic */
    topicId: number;
    /** Function that handles the creation of a new note
     * @param topicId ID of the parent topic
     * @param text Text for the new note
     */
    addNote: (topicId: number, text: string) => Promise<void>;
}

/** Component that includes the form for creating a new note */
export default function CreateNote(props: ICreateNoteProps) {
    const [newNote, setNewNote] = useState<string>('');

    const submitRef = useRef<HTMLInputElement>(null);

    async function onFinish(text: string) {
        if (!text) return;

        if (submitRef.current) submitRef.current.disabled = true;

        await props.addNote(props.topicId, text);

        setNewNote('');
        if (submitRef.current) submitRef.current.disabled = false;
    }

    return (
        <form className='flex justify-between p-0 mb-2'
            onSubmit={event => {
                event.preventDefault();
                onFinish(newNote);
            }}>

            <input
                className='align-middle flex-grow mr-1.5 h-7 px-1 focus:outline-none rounded-sm shadow-inner bg-green-100'
                type='text'
                placeholder='Create a new note...'
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
            />

            <label>
                <input type='submit' ref={submitRef} hidden />
                <AddCircleOutlineIcon fontSize='default' className={iconStyle} />
            </label>

        </form>
    );
}