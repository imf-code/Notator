import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ITopic } from './Interfaces';
import Note from './Note';

interface ITopicsProps {
    subId: number;
}

/** Component for displaying and manipulating topics and the notes under each topic. TODO: ADD, RENAME, DELETE */
export default function NoteTable(props: ITopicsProps) {

    const [topics, setTopics] = useState<ITopic[] | undefined>(undefined);

    useEffect(() => {
        axios.get(`/api/topic/${props.subId}/with-notes`)
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(resp);
                    alert('Something went wrong with retrieving your list of topics. Please try again later.');
                    return;
                }
                else {
                    setTopics(resp.data);
                }
            }).catch(err => {
                console.log(err.response.data);
                alert('Something went wrong with retrieving your list of topics. Please try again later.');
                return;
            });
    },
        [props.subId]
    );

    const topicArray = useMemo(() => {
        if (!topics) return null;

        return topics.map((topic) => {
            return (
                <div key={topic.id}>
                    {topic.name}
                    {topic.notes && topic.notes.map(note => {
                        return <Note key={note.id} {...note} />;
                    })}
                </div>
            );
        });
    },
        [topics]
    );

    return (
        <div>
            {topicArray}
        </div>
    );
}