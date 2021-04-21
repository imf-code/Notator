import { useEffect, useRef, useState } from "react";
import { HeaderFormButton } from "./Buttons.Header";

interface ICreateSubjectProps {
    /** Handler function for creating a subject
     * @param name Name of the new subject
     */
    addSubject: (name: string) => Promise<void>;
}

/** Component for inputting a name for new subject */
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
                className='w-52 h-7 mx-0.5 p-1 focus:outline-none rounded-sm shadow-inner bg-green-100'
                ref={inputRef}
                placeholder='Enter name...'
                value={newSubject}
                onChange={(event) => setNewSubject(event.target.value)}
            />

            <HeaderFormButton type='submit' value='Save' />

        </form>
    );
}