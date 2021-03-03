import { INote } from './Interfaces';

/** Component for displaying a single note. TODO: ADD, EDIT, MOVE, DELETE */
export default function Note(props: INote) {

    return (
        <div>
            {props.id}.&nbsp;{props.text}
        </div>
    );
}