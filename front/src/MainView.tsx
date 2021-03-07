import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { INote, ITopic } from './Interfaces';
import Topic from './Topic';
import CreateTopic from './Topic.Create';
import Note from './Note';
import CreateNote from './Note.Create';

interface ITopicsProps {
    /** ID of the parent subject */
    subId: number;
}

/** Component for displaying and manipulating topics and the notes under each topic. */
export default function MainView(props: ITopicsProps) {

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
    async function addTopic(name: string) {
        const newId = await axios.post('/api/topic', {
            subId: props.subId,
            topic: name
        }).then(resp => {
            if (resp.status === 201) return resp.data[0].id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('Something went wrong while attempting to create a new topic. Please try again later.');
            return null;
        });

        if (newId === null) return;

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        if (newId) {
            const newTopic: ITopic = {
                id: newId,
                name: name,
                notes: []
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
            if (err.response && err.response.status === 400) alert(err.response.data);
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

        const updatedTopic = await apiResponse;

        if (updatedTopic === null) return;
        else if (updatedTopic === topicId) {
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
        const apiResponse = axios.delete(`/api/topic/${topicId}`)
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

        const deletedTopic = await apiResponse

        if (deletedTopic === null) return;
        else if (deletedTopic === topicId) {
            setTopicsAndNotes(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [topicsAndNotes]
    );

    /**
     * Create a new note under provided topic
     * @param topicId ID of the parent topic
     * @param text Text for the new note
     */
    const addNote = useCallback(async (topicId: number, text: string) => {
        const newId = await axios.post('/api/note', {
            subId: props.subId,
            topicId: topicId,
            note: text
        }).then(resp => {
            if (resp.status === 201) return resp.data[0].id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('Something went wrong while attempting to create a new topic. Please try again later.');
            return null;
        });

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        if (newId) {
            const newNote: INote = {
                id: newId,
                text: text
            }
            const newTopics = topicsAndNotes.map(topic => {
                if (topic.id !== topicId) return topic;
                else return {
                    ...topic,
                    notes: [...topic.notes, newNote]
                }
            })

            setTopicsAndNotes(newTopics);
        }
    },
        [topicsAndNotes, props.subId]
    );

    /**
     * Edit the text of a note
     * @param topicId ID of the parent topic
     * @param noteId ID of the note to be modified
     * @param text New text for the note
     */
    const editNote = useCallback(async (topicId: number, noteId: number, text: string) => {
        const apiResponse = axios.patch(`/api/note/${noteId}`, {
            note: text
        }).then(resp => {
            if (resp.status === 200) return resp.data.id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('Something went wrong while editing the note. Please try again later.');
            return null;
        });

        if (!topicsAndNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newTopics = topicsAndNotes.map(topic => {
            if (topic.id !== topicId) return topic;
            else return {
                ...topic,
                notes: topic.notes.map(note => {
                    return note.id !== noteId ? note : { ...note, text: text }
                })
            };
        });

        const updatedNote = await apiResponse;

        if (updatedNote === null) return;
        else if (updatedNote === noteId) {
            setTopicsAndNotes(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [topicsAndNotes]
    );

    /**
     * **WIP**
     * Move a note to another topic
     * @param topicId ID of the topic to be move the note to.
     * @param noteID ID of the note to be moved.
     */
    // eslint-disable-next-line
    const moveNote = useCallback(async (topicId: number, noteId: number) => {
        const apiResponse = axios.patch(`/api/note/move/`, {
            topicId: topicId,
            noteId: noteId
        }).then(resp => {
            if (resp.status === 200) return resp.data.id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('Something went wrong while editing the note. Please try again later.');
            return null;
        });

        let newTopics: ITopic[];

        try {
            if (!topicsAndNotes) throw new Error();

            let oldTopic = topicsAndNotes.find(topic => {
                return topic.notes.find(note => {
                    return note.id === noteId;
                });
            });
            let newTopic = topicsAndNotes.find(topic => {
                return topic.id === topicId;
            })

            const filteredNotes = oldTopic?.notes.filter(note => {
                return note.id !== noteId;
            });
            const movingNote = oldTopic?.notes.find(note => {
                return note.id === noteId;
            });

            if (!oldTopic || !newTopic || !filteredNotes || !movingNote) throw new Error();
            const oldTopicId = oldTopic.id;

            oldTopic.notes = [...filteredNotes];
            newTopic.notes = [...newTopic.notes, movingNote];

            newTopics = topicsAndNotes.map(topic => {
                if (topic.id === oldTopicId) return oldTopic as ITopic;
                else if (topic.id === topicId) return newTopic as ITopic;
                else return topic;
            });
        }
        catch (err) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const movedNote = await apiResponse;

        if (movedNote === null) return;
        else if (movedNote === noteId) {
            setTopicsAndNotes(newTopics);
        }
        else {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }
    },
        [topicsAndNotes]
    );

    /**
     * Delete a note
     * @param topicId ID of the parent topic
     * @param noteId ID of the note to be deleted
     */
    const deleteNote = useCallback(async (topicId: number, noteId: number) => {
        const apiResponse = axios.delete(`/api/note/${noteId}`)
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

        const newTopics = topicsAndNotes.map(topic => {
            if (topic.id !== topicId) return topic;
            else return {
                ...topic,
                notes: topic.notes.filter(note => {
                    return note.id !== noteId;
                })
            }
        });

        const deletedNote = await apiResponse;

        if (deletedNote === null) return;
        else if (deletedNote === noteId) {
            setTopicsAndNotes(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [topicsAndNotes]
    );

    /** Array of Topic components with their Note children */
    const topicAndNoteArray = useMemo(() => {
        if (!topicsAndNotes) return null;

        return topicsAndNotes.map(topic => {
            return (
                <Topic key={topic.id} topic={topic} onEdit={renameTopic} onDelete={deleteTopic} >
                    <div>
                        <CreateNote key={topic.id} addNote={addNote} topicId={topic.id} />
                        {topic.notes && topic.notes.map(note => {
                            return <Note key={note.id} topicId={topic.id} onEdit={editNote} onDelete={deleteNote} {...note} />
                        })}
                    </div>
                </Topic>
            );
        });
    },
        [topicsAndNotes, deleteTopic, renameTopic, editNote, deleteNote, addNote]
    )

    return (
        <div>
            <CreateTopic addTopic={addTopic} />
            {topicAndNoteArray}
        </div>
    );
}