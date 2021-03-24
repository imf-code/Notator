import { useEffect, useRef, useState } from 'react'
import { iconStyle } from './Buttons.Icons';

// Icons
import EditIcon from '@material-ui/icons/Edit';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';

interface ITopicProps {
    /** Child components if any */
    children?: JSX.Element | JSX.Element[] | Array<JSX.Element | JSX.Element[] | undefined>;
    /** Topic ID */
    id: number;
    /** Topic name */
    name: string;
    /**
     * Handler for renaming a topic
     * @param topicId ID of the topic to be modified
     * @param name New name for the topic 
     */
    onEdit: (topicId: number, name: string) => Promise<void>;
    /**
     * Handler for deleting a topic
     * @param topicId ID of the topic to be deleted
     */
    onDelete: (topicId: number) => Promise<void>
}

/**
 * Component for manipulating and displaying a single topic as a column
 */
export default function Topic(props: ITopicProps) {

    const [edit, setEdit] = useState<boolean>(false);
    const [editedName, setEditedName] = useState<string>(props.name);

    const editRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!edit) return;
        else if (inputRef.current) inputRef.current.focus();
    },
        [edit]
    );

    /**
     * Handle editing of topic name
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

    function onCancelEdit() {
        setEditedName(props.name);
        setEdit(false);
        return;
    }

    return (
        <div className='flex flex-none flex-col overflow-hidden border-green-200 border-r4 w-80 m-2 box-border bg-green-200 rounded-md shadow-md'>
            <div className='flex justify-between mb-1'>
                <div className='w-5/6 pl-1'>
                    {edit ?
                        <input type='text' value={editedName} onChange={event => setEditedName(event.target.value)}
                            ref={inputRef}
                            className='text-lg font-medium w-full h-7 px-1 -mx-1 focus:outline-none rounded-sm shadow-inner bg-green-100' /> :
                        <p className='text-lg truncate font-medium'>
                            {props.name}
                        </p>}
                </div>

                <div>
                    {edit ?
                        <button onClick={onStopEdit} ref={editRef}
                            className='focus:outline-none'>
                            <SaveAltIcon fontSize='small' className={iconStyle} />
                        </button> :
                        <button onClick={() => setEdit(true)}
                            className='focus:outline-none'>
                            <EditIcon fontSize='small' className={iconStyle} />
                        </button>}
                    {edit ?
                        <button onClick={onCancelEdit}
                            className='focus:outline-none'>
                            <CancelIcon fontSize='small' className={iconStyle} />
                        </button> :
                        <button onClick={() => props.onDelete(props.id)}
                            className='focus:outline-none'>
                            <DeleteIcon fontSize='small' className={iconStyle} />
                        </button>}
                </div>
            </div>

            {props.children}

        </div>
    )
}