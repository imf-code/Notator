import { useMemo } from 'react';
import { ISubject } from './Interfaces';
import Note from './Note';

interface ITopicsProps {
    data: ISubject | undefined;
}

/** Component for displaying and manipulating topics and the notes under each topic. TODO: ADD, RENAME, DELETE */
export default function Topics(props: ITopicsProps) {

    const topicArray = useMemo(() => {
        if (!props.data) return null;

        return props.data.topics.map((topic) => {
            return (
                <div key={topic.id}>
                    {topic.name}
                    {topic.notes.map(note => {
                        return <Note key={note.id} {...note} />;
                    })}
                </div>
            );
        });
    }, [props.data]);

    return (
        <div>
            {topicArray}
        </div>
    );
}