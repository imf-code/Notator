import { useEffect, useRef, useState } from "react";
import { HeaderSubmit } from "./HeaderButtons";

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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    },
        []
    );

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
                className='w-52 h-7 mx-0.5 focus:outline-none rounded-sm shadow-inner bg-green-100'
                ref={inputRef}
                placeholder='Enter name...'
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
            />

            <HeaderSubmit value='Create' />

        </form>
    );
}