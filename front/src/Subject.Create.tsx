import { useRef, useState } from "react";

interface ICreateSubjectProps {
    /** Function that handles the creation of a new subject
     * @param name Name of the new subject.
     */
    addSubject: (name: string) => Promise<void>;
}

/** Component that includes the form for creating a new note */
export default function CreateSubject(props: ICreateSubjectProps) {
    const [newSubject, setNewSubject] = useState<string>('');

    const submitRef = useRef<HTMLInputElement>(null);

    async function onFinish(name: string) {
        if (!name) return;

        if (submitRef.current) submitRef.current.disabled = true;

        await props.addSubject(name);

        if (submitRef.current) submitRef.current.disabled = false;
    }

    return (
        <form style={{ display: 'inline' }}
            onSubmit={event => {
                event.preventDefault();
                onFinish(newSubject);
            }}>
            <input
                type='text'
                placeholder='Create a new note...'
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
            />

            <input
                type='submit'
                value='Create'
            />
        </form>
    );
}