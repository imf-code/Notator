import { useRef, useState } from "react";
import { ITopic } from "./Interfaces";

interface ITopicProps {
    /** Child components if any. Note components expected */
    children?: JSX.Element | JSX.Element[];
    /** Topic object including name and ID */
    topic: ITopic;
    /**
     * Function for handling renaming of topic
     * @param topicId ID of the topic to be modified
     * @param name New name for the topic 
     */
    onEdit: (topicId: number, name: string) => Promise<void>;
    /**
     * Function for deleting the topic
     * @param topicId ID of the topic to be deleted
     */
    onDelete: (topicId: number) => Promise<void>
}

/**
 * Component for displaying a single topic and all the notes related to it.
 * Includes rename and delete functionality.
 */
export default function Topic(props: ITopicProps) {

    const [edit, setEdit] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>(props.topic.name);

    const editRef = useRef<HTMLButtonElement>(null);

    /**
     * Handle editing of name
     */
    function onStopEdit() {
        if (!editedName) {
            setEditedName(props.topic.name);
            setEdit(false);
            return;
        }
        else if (editedName === props.topic.name) {
            setEdit(false);
            return;
        }
        else {
            (async () => {
                if (editRef.current) editRef.current.disabled = true;

                await props.onEdit(props.topic.id, editedName);

                if (editRef.current) editRef.current.disabled = false;
                setEdit(false);
            })();
        }
    }
    return (
        <div>
            {edit ?
                <span>
                    <input type='text' value={editedName} onChange={event => setEditedName(event.target.value)} />
                    <button onClick={onStopEdit} ref={editRef}>
                        {editedName === props.topic.name || !editedName ? 'Cancel' : 'Save'}
                    </button>
                </span> :
                <span>
                    {props.topic.name}
                    <button onClick={() => setEdit(true)}>
                        Edit
                    </button>
                </span>}

            <button onClick={() => props.onDelete(props.topic.id)}>
                Delete
            </button>

            {props.children}
        </div >
    )
}