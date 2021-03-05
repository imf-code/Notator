import { useRef, useState } from "react";

interface ICreateTopicProps {
    /** Function that handles the creation of new topic
     * @param name Name of the new topic
     */
    addTopic: (name: string) => Promise<void>;
}

/** Component that includes the form for creating a new topic */
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
        <form onSubmit={event => {
            event.preventDefault();
            onFinish(newTopic);
        }}>
            <input
                type='text'
                placeholder='Create a new topic...'
                value={newTopic}
                onChange={(event) => setNewTopic(event.target.value)}
            />

            <input
                type='submit'
                value='Create'
            />
        </form>
    );
}