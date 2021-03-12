import { useRef, useState } from "react";
import HeaderButton, { HeaderSubmit } from "./HeaderButtons";

interface ISubjectProps {
    /** Subject ID*/
    id: number;
    /** Current name of the subject */
    name: string;
    /** Handler for submitting edited name */
    onEdit: (id: number, name: string) => Promise<void>;
    /** Function for canceling edit without modifications */
    cancelEdit: () => void;
}

/**
 * Component for editing a subject.
 */
export default function EditSubject(props: ISubjectProps) {
    const [editedName, setEditedName] = useState<string>(props.name);

    const editRef = useRef<HTMLInputElement>(null);

    function onStopEdit() {
        if (!editedName) {
            props.cancelEdit();
            return;
        }
        else if (editedName === props.name) {
            props.cancelEdit();
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
                    <HeaderSubmit ref={editRef} value='Save' />
                    {/* <input type='button' onClick={props.cancelEdit} value='Cancel' /> */}
                    <HeaderButton onClick={props.cancelEdit} >
                        Cancel
                    </HeaderButton>
                </form>
            </span>
        </span>
    );
}