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

interface INoteWithTopic extends INote {
    /** Topic ID */
    topicId: number;
}

/** Component for displaying and manipulating topics and the notes under each topic. */
export default function MainView(props: ITopicsProps) {

    const [localNotes, setLocalNotes] = useState<Map<number, INoteWithTopic> | undefined>(undefined);
    const [localTopics, setLocalTopics] = useState<Map<number, string> | undefined>(undefined);

    // GET Topics and Notes from API and transform them into Map objects
    useEffect(() => {
        (async () => {
            const apiResponse = axios.get(`/api/topic/${props.subId}/with-notes`)
                .then(resp => {
                    if (resp.status !== 200) {
                        console.log(resp);
                        alert('Something went wrong while retrieving your list of topics. Please try again later.');
                        return undefined;
                    }
                    else {
                        return resp.data as ITopic[];
                    }
                }).catch(err => {
                    console.log(err.response.data);
                    alert('Something went wrong while retrieving your list of topics. Please try again later.');
                    return undefined;
                });

            const newNotes = new Map<number, INoteWithTopic>();
            const newTopics = new Map<number, string>();

            const topicsAndNotes = await apiResponse;

            if (!topicsAndNotes) return;

            topicsAndNotes.forEach(topic => {
                topic.notes.forEach(note => {
                    newNotes.set(note.id, { ...note, topicId: topic.id } as INoteWithTopic);
                });
            });
            topicsAndNotes.forEach(topic => {
                newTopics.set(topic.id, topic.name);
            });

            setLocalTopics(newTopics);
            setLocalNotes(newNotes);;

        })();
    },
        [props.subId]
    )

    /**
     * Create a new topic under currently selected subject
     * @param name Name for the new topic
     */
    async function addTopic(name: string) {
        if (!localTopics) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

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

        if (newId) {
            const newTopics = new Map(localTopics);
            newTopics.set(newId, name);

            setLocalTopics(newTopics);
        }
        else return;
    }

    /**
     * Rename an existing topic
     * @param topicId ID of topic to be modified
     * @param name New name for the topic
     */
    const renameTopic = useCallback(async (topicId: number, name: string) => {
        if (!localTopics) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

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

        const newTopics = new Map(localTopics);
        newTopics.set(topicId, name);

        const updatedTopic = await apiResponse;
        if (updatedTopic === null) return;
        else if (updatedTopic === topicId) {
            setLocalTopics(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localTopics]
    );

    /**
     * Delete a topic
     * @param topicId ID of the topic to be deleted
     */
    const deleteTopic = useCallback(async (topicId: number) => {
        if (!localTopics) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const apiResponse = axios.delete(`/api/topic/${topicId}`)
            .then(resp => {
                if (resp.status === 200) return resp.data.id as number;
                else throw new Error();
            }).catch(err => {
                console.log(err.response.data);
                alert('Something went wrong while deleting the topic. Please try again later.');
                return null;
            });

        const newTopics = new Map(localTopics);
        newTopics.delete(topicId);

        const deletedTopic = await apiResponse;

        if (deletedTopic === null) return;
        else if (deletedTopic === topicId) {
            setLocalTopics(newTopics);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localTopics]
    );

    /**
     * Create a new note under provided topic
     * @param topicId ID of the parent topic
     * @param text Text for the new note
     */
    const addNote = useCallback(async (topicId: number, text: string) => {
        if (!localNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newId = await axios.post('/api/note', {
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

        if (newId) {
            const newNote: INoteWithTopic = {
                id: newId,
                text: text,
                topicId: topicId
            }

            const newNotes = new Map(localNotes);
            newNotes.set(newId, newNote);

            setLocalNotes(newNotes);
        }
        else return;
    },
        [localNotes]
    );

    /**
     * Edit the text of a note
     * @param noteId ID of the note to be modified
     * @param text New text for the note
     */
    const editNote = useCallback(async (noteId: number, text: string) => {
        if (!localNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

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

        const newNotes = new Map(localNotes);
        const oldNote = newNotes.get(noteId);

        if (!oldNote) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newNote = { ...oldNote, text: text } as INoteWithTopic;
        newNotes.set(noteId, newNote);

        const updatedNote = await apiResponse;

        if (updatedNote === null) return;
        else if (updatedNote === noteId) {
            setLocalNotes(newNotes);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localNotes]
    );

    /**
     * **WIP**
     * Move a note to another topic
     * @param topicId ID of the topic to be move the note to.
     * @param noteID ID of the note to be moved.
     */
    // eslint-disable-next-line
    const moveNote = useCallback(async (topicId: number, noteId: number) => {
        if (!localNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

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

        const newNotes = new Map(localNotes);
        const oldNote = newNotes.get(noteId);

        if (!oldNote) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newNote = { ...oldNote, topicId: topicId } as INoteWithTopic;
        newNotes.set(noteId, newNote);

        const movedNote = await apiResponse;

        if (movedNote === null) return;
        else if (movedNote === noteId) {
            setLocalNotes(newNotes);
        }
        else {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }
    },
        [localNotes]
    );

    /**
     * Delete a note
     * @param noteId ID of the note to be deleted
     */
    const deleteNote = useCallback(async (noteId: number) => {
        if (!localNotes) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const apiResponse = axios.delete(`/api/note/${noteId}`)
            .then(resp => {
                if (resp.status === 200) return resp.data.id as number;
                else throw new Error();
            }).catch(err => {
                console.log(err.response.data);
                alert('Something went wrong while deleting the note. Please try again later.');
                return null;
            });

        const newNotes = new Map(localNotes);
        newNotes.delete(noteId);

        const deletedNote = await apiResponse;

        if (deletedNote === null) return;
        else if (deletedNote === noteId) {
            setLocalNotes(newNotes);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localNotes]
    );

    /**
     * Array of Note components for each topic
     */
    const noteMap = useMemo(() => {
        if (!localNotes) return null;

        const elementMap = new Map<number, JSX.Element[]>();

        localNotes.forEach(note => {
            const newElement = <Note key={note.id} onEdit={editNote} onDelete={deleteNote} {...note} />;
            const existingNotes = elementMap.get(note.topicId);

            if (existingNotes) existingNotes.push(newElement);
            else elementMap.set(note.topicId, [newElement]);
        });

        return elementMap;
    },
        [localNotes, editNote, deleteNote]
    );

    /** Array of Topic components with their Note children */
    const topicAndNoteArray = useMemo(() => {
        if (!localTopics || !noteMap) return null;

        let topicArray: JSX.Element[] = [];

        localTopics.forEach((topicName, topicId) => {
            const noteElements = noteMap.get(topicId);

            topicArray.push(
                <Topic key={topicId}
                    id={topicId}
                    name={topicName}
                    onEdit={renameTopic}
                    onDelete={deleteTopic} >
                    <CreateNote key={topicId} addNote={addNote} topicId={topicId} />
                    <div className='overflow-y-scroll h-full -mr-1.5 bar-sm'>
                        {noteElements ?? null}
                    </div>
                </Topic>
            );
        });

        return topicArray;
    },
        [localTopics, noteMap, deleteTopic, renameTopic, addNote]
    );

    return (
        <div className='flex flex-col flex-grow w-full bg-yellow-50 overflow-x-scroll'>
            <div className='mx-4 mt-2'>
                <CreateTopic addTopic={addTopic} />
            </div>
            <div className='flex h-full flex-nowrap overflow-hidden flex-row px-2 pb-2'>
                {topicAndNoteArray}
            </div>
        </div>
    );
}