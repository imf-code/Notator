import { useRef, useState } from "react";

interface INewTopicProps {
    /** Function that handles the creation of new topic
     * @param name Name of the new topic
     */
    addTopic: (name: string) => Promise<void>;
}

/** Component that includes the form for creating a new topic */
export default function NewTopic(props: INewTopicProps) {
    const [newTopic, setNewTopic] = useState<string>('');

    const submitRef = useRef<HTMLInputElement>(null);

    async function onFinish(name: string) {
        if (!name) return;

        if (submitRef.current) submitRef.current.disabled = true;

        props.addTopic(name);

        if (submitRef.current) submitRef.current.disabled = false;
    }

    return (
        <form onSubmit={event => {
            event.preventDefault();
            onFinish(newTopic);
        }}>
            <input
                type='text'
                placeholder='Create new topic...'
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