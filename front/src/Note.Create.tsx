import { useRef, useState } from "react";

interface ICreateNoteProps {
    /** ID of the parent topic */
    topicId: number;
    /** Function that handles the creation of a new note
     * @param topicId ID of the parent topic
     * @param name Text for the new note
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

        if (submitRef.current) submitRef.current.disabled = false;
    }

    return (
        <form onSubmit={event => {
            event.preventDefault();
            onFinish(newNote);
        }}>
            <input
                type='text'
                placeholder='Create a new note...'
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
            />

            <input
                type='submit'
                value='Create'
            />
        </form>
    );
}