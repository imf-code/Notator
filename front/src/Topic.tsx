import { useRef, useState } from "react";
import { HeaderButton } from "./Buttons.Header";

interface ITopicProps {
    /** Child components if any. Note components expected */
    children?: JSX.Element | JSX.Element[];
    /** Topic ID */
    id: number;
    /** Topic name */
    name: string;
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
    const [editedName, setEditedName] = useState<string>(props.name);

    const editRef = useRef<HTMLButtonElement>(null);

    /**
     * Handle editing of name
     */
    function onStopEdit() {
        if (!editedName) {
            setEditedName(props.name);
            setEdit(false);
            return;
        }
        else if (editedName === props.name) {
            setEdit(false);
            return;
        }
        else {
            (async () => {
                if (editRef.current) editRef.current.disabled = true;

                await props.onEdit(props.id, editedName);

                if (editRef.current) editRef.current.disabled = false;
                setEdit(false);
            })();
        }
    }
    return (
        <div className='flex-none p-4 w-72 m-2 bg-green-200 rounded-md shadow-md'>
            <div className='flex justify-between m-1'>
                {edit ?
                    <input type='text' value={editedName} onChange={event => setEditedName(event.target.value)} /> :
                    <p className='text-lg truncate font-medium'>
                        {props.name}
                    </p>}
                <div>
                    {edit ?
                        <HeaderButton onClick={onStopEdit} ref={editRef}>
                            {editedName === props.name || !editedName ? 'Cancel' : 'Save'}
                        </HeaderButton> :
                        <HeaderButton onClick={() => setEdit(true)}>
                            Edit
                        </HeaderButton>}
                    <HeaderButton onClick={() => props.onDelete(props.id)}>
                        Delete
                    </HeaderButton>
                </div>
            </div>

            {props.children}
        </div>
    )
}