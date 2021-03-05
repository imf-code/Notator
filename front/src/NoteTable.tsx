import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ITopic } from './Interfaces';
import Topic from './Topic';
import NewTopic from './Topic.New';
import Note from './Note';

interface ITopicsProps {
    /** ID of the parent subject */
    subId: number;
}

/** Component for displaying and manipulating topics and the notes under each topic. */
export default function NoteTable(props: ITopicsProps) {

    const [topicsAndNotes, setTopicsAndNotes] = useState<ITopic[] | undefined>(undefined);

    // GET Topics and Notes
    useEffect(() => {
        axios.get(`/api/topic/${props.subId}/with-notes`)
            .then(resp => {
                if (resp.status !== 200) {
                    console.log(resp);
                    alert('Something went wrong while retrieving your list of topics. Please try again later.');
                    return;
                }
                else {
                    setTopicsAndNotes(resp.data);
                }
            }).catch(err => {
                console.log(err.response.data);
                alert('Something went wrong while retrieving your list of topics. Please try again later.');
                return;
            });
    },
        [props.subId]
    )

    /**
     * Create a new topic under currently selected subject
     * @param name Name for the new topic
     */
    async function createTopic(name: string) {
        const newId = await axios.post('/api/topic', {
            subId: props.subId,
            topic: name
        }).then(resp => {
            if (resp.status === 201) return resp.data[0].id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert('Name is required.');
            else alert('Something went wrong while attempting to create a new topic. Please try again later.');
            return null;
        });

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }
        
        console.log(newId);
        if (newId) {
            const newTopic: ITopic = {
                id: newId,
                name: name
            }

            setTopicsAndNotes([...topicsAndNotes, newTopic]);
        }
    }

    /**
     * Rename an existing topic
     * @param topicId ID of topic to be modified
     * @param name New name for the topic
     */
    const renameTopic = useCallback(async (topicId: number, name: string) => {
        const apiResponse = axios.patch(`/api/topic/${topicId}`, {
            name: name
        }).then(resp => {
            if (resp.status === 200) return resp.data.id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert('Name is required.');
            else alert('Something went wrong while renaming the topic. Please try again later.');
            return null;
        });

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newTopics = topicsAndNotes.map(topic => {
            return topic.id !== topicId ? topic : { ...topic, name: name };
        });

        if ((await apiResponse) === topicId) {
            setTopicsAndNotes(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [topicsAndNotes]
    );

    /**
     * Delete a topic
     * @param topicId ID of the topic to be deleted
     */
    const deleteTopic = useCallback(async (topicId: number) => {
        const affectedResource = axios.delete(`/api/topic/${topicId}`)
            .then(resp => {
                if (resp.status === 200) return resp.data.id as number;
                else throw new Error();
            }).catch(err => {
                console.log(err);
                alert('Something went wrong while deleting the topic. Please try again later.');
                return null;
            });

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newTopics = topicsAndNotes.filter(topic => {
            return topic.id !== topicId;
        });

        if ((await affectedResource) === topicId) {
            setTopicsAndNotes(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [topicsAndNotes]
    );

    /** Array of Topic components with thir Note children */
    const topicAndNoteArray = useMemo(() => {
        if (!topicsAndNotes) return null;

        return topicsAndNotes.map(topic => {
            return (
                <Topic key={topic.id} topic={topic} onEdit={renameTopic} onDelete={deleteTopic} >
                    {topic.notes && topic.notes.map(note => {
                        return <Note key={note.id} {...note} />
                    })}
                </Topic>
            );
        });
    },
        [topicsAndNotes, deleteTopic, renameTopic]
    )

    return (
        <div>
            <NewTopic addTopic={createTopic} />
            {topicAndNoteArray}
        </div>
    );
}