import { useRef, useState } from "react";
import { ISubject } from "./Interfaces";

interface ISubjectProps {
    data: ISubject;
    setCurrentSubject: React.Dispatch<React.SetStateAction<ISubject | undefined>>;
    onEdit: (id: number, name: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

/**
 * Component for displaying a single subject with rename and delete functionality.
 */
export default function Subject(props: ISubjectProps) {
    const [edit, setEdit] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>(props.data.name);

    const editRef = useRef<HTMLButtonElement>(null);

    function onStopEdit() {
        if (!editedName) {
            setEditedName(props.data.name);
            setEdit(false);
            return;
        }
        else if (editedName === props.data.name) {
            setEdit(false);
            return;
        }
        else {
            (async () => {
                if (editRef.current) editRef.current.disabled = true;

                await props.onEdit(props.data.id, editedName);

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
                        {editedName === props.data.name || !editedName ? 'Cancel' : 'Save'}
                    </button>
                </span> :
                <span>
                    <span onClick={() => props.setCurrentSubject(props.data)}>
                        {props.data.name}
                    </span>
                    <button onClick={() => setEdit(true)}>
                        Edit
                    </button>
                </span>}
            <button onClick={() => props.onDelete(props.data.id)} >
                Delete
            </button>
        </div>
    );
}