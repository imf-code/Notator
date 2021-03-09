import { useRef, useState } from "react";

interface ISubjectProps {
    /** Subject ID*/
    id: number;
    /** Current name of the subject */
    name: string;
    /** Handler for submitting edited name */
    onEdit: (id: number, name: string) => Promise<void>;
}

/**
 * Component for editing a subject.
 */
export default function EditSubject(props: ISubjectProps) {
    const [editedName, setEditedName] = useState<string>(props.name);

    const editRef = useRef<HTMLInputElement>(null);

    function onStopEdit() {
        if (!editedName) {
            setEditedName(props.name);
            return;
        }
        else if (editedName === props.name) {
            return;
        }
        else {
            (async () => {
                if (editRef.current) editRef.current.disabled = true;

                await props.onEdit(props.id, editedName);

                if (editRef.current) editRef.current.disabled = false;
            })();
        }
    }

    return (
        <span>
            <span>
                <form style={{ display: 'inline' }}
                    onSubmit={event => {
                        event.preventDefault();
                        onStopEdit();
                    }}>
                    <input type='text' value={editedName} onChange={event => setEditedName(event.target.value)} />
                    <input type='submit' ref={editRef} value={!editedName ? 'Cancel' : 'Save'} />
                </form>
            </span>
        </span>
    );
}