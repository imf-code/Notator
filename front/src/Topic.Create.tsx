import { useRef, useState } from "react";
import { HeaderFormButton } from "./Buttons.Header";

interface ICreateTopicProps {
    /** Handler for creating a new topic
     * @param name Name of the new topic
     */
    addTopic: (name: string) => Promise<void>;
}

/** Component for inputing a name for a new topic */
export default function CreateTopic(props: ICreateTopicProps) {
    const [newTopic, setNewTopic] = useState<string>('');

    const submitRef = useRef<HTMLInputElement>(null);

    async function onFinish(name: string) {
        if (!name) return;

        if (submitRef.current) submitRef.current.disabled = true;

        await props.addTopic(name);

        if (submitRef.current) submitRef.current.disabled = false;
    }

    return (
        <form className='flex justify-between w-72'
            onSubmit={event => {
                event.preventDefault();
                onFinish(newTopic);
            }}>

            <input className='flex-grow align-middle mr-1 p-1 focus:outline-none rounded-sm shadow-inner bg-green-100'
                type='text'
                placeholder='Create a new topic...'
                value={newTopic}
                onChange={(event) => setNewTopic(event.target.value)}
            />

            <HeaderFormButton
                ref={submitRef}
                type='submit'
                value='Create'
            />
        </form>
    );
}