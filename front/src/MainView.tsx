import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

interface ITopicWithOrder {
    name: string;
    noteOrder: number[];
}

/** Component for displaying and manipulating topics and the notes under each topic */
export default function MainView(props: ITopicsProps) {

    const [localNotes, setLocalNotes] = useState<Map<number, INoteWithTopic> | undefined>(undefined);
    const [localTopics, setLocalTopics] = useState<Map<number, ITopicWithOrder> | undefined>(undefined);
    const [selectedNote, setSelectedNote] = useState<number | undefined>(undefined);

    // GET Topics and Notes and turn them into Map objects for internal use
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

            const topicsAndNotes = await apiResponse;

            if (!topicsAndNotes) return;

            const newTopics = new Map<number, ITopicWithOrder>();
            const newNotes = new Map<number, INoteWithTopic>();

            topicsAndNotes.forEach(topic => {
                newTopics.set(topic.id, { name: topic.name, noteOrder: JSON.parse(topic.noteOrder) as number[] });
                topic.notes.forEach(note => {
                    newNotes.set(note.id, { ...note, topicId: topic.id } as INoteWithTopic);
                });
            });

            setLocalTopics(newTopics);
            setLocalNotes(newNotes);;

        })();
    },
        [props.subId]
    )

    /**
     * Create a new topic under currently selected subject
     * @param name Name of the new topic to be created
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
            return undefined;
        });

        if (newId) {
            const newTopics = new Map(localTopics);
            newTopics.set(newId, { name: name, noteOrder: [] });

            setLocalTopics(newTopics);
        }
        else return;
    }

    /**
     * Rename an existing topic
     * @param topicId ID of the topic to be renamed
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
            return undefined;
        });

        const oldTopic = localTopics.get(topicId);
        if (!oldTopic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newTopics = new Map(localTopics);
        newTopics.set(topicId, { name: name, noteOrder: oldTopic.noteOrder });
        setLocalTopics(newTopics);

        const updatedTopic = await apiResponse;

        if (!updatedTopic || (updatedTopic === topicId)) return;
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
                return undefined;
            });

        const newTopics = new Map(localTopics);
        newTopics.delete(topicId);

        const deletedTopic = await apiResponse;
        setLocalTopics(newTopics);

        if (!deletedTopic || (deletedTopic === topicId)) return;
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
        if (!localNotes || !localTopics) {
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

        if (!newId) return;

        const newNote: INoteWithTopic = {
            id: newId,
            text: text,
            topicId: topicId
        }

        const newNotes = new Map(localNotes);
        newNotes.set(newId, newNote);

        const newTopics = new Map(localTopics);
        const topic = newTopics.get(topicId);

        if (!topic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        };

        newTopics.set(topicId, { name: topic.name, noteOrder: [newId, ...topic.noteOrder] });

        setLocalTopics(newTopics);
        setLocalNotes(newNotes);

        axios.patch(`/api/topic/order/${topicId}`, {
            order: JSON.stringify([newId, ...topic.noteOrder])
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        })
    },
        [localNotes, localTopics]
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
            return undefined;
        });

        const newNotes = new Map(localNotes);
        const oldNote = newNotes.get(noteId);

        if (!oldNote) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newNote = { ...oldNote, text: text } as INoteWithTopic;
        newNotes.set(noteId, newNote);
        setLocalNotes(newNotes);

        const updatedNote = await apiResponse;

        if (!updatedNote || (updatedNote === noteId)) return;
        else alert('Something went wrong. Please try refreshing the page.');
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
        setLocalNotes(newNotes);

        const deletedNote = await apiResponse;

        if (!deletedNote || (deletedNote === noteId)) return;
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
     * Reorder notes within a topic
     */
    const reorderNotes = useCallback((topicId: number, startInd: number, endInd: number) => {
        if (!localTopics) return;

        const topic = localTopics.get(topicId);

        if (!topic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newOrder = [...topic.noteOrder];

        const [movingNoteId] = newOrder.splice(startInd, 1);
        newOrder.splice(endInd, 0, movingNoteId);

    },
        [localTopics]
    );


    const onDragEnd = useCallback((result: DropResult) => {
        console.log('Foo');
        return;

        // const { source, destination } = result;

        // if (!destination) return;

        // const sTopicId = +source.droppableId;
        // const dTopicId = +destination.droppableId;

        // if (sTopicId === dTopicId) {
        //     reorderNotes(sTopicId, source.index, destination.index);
        //     return;
        // }
        // else {
        //     return;
        // }
    },
        []
    );

    /**
     * Select/unselect a note
     * @param noteId Note ID
     */
    const selectNote = useCallback((noteId: number) => {
        if (noteId === selectedNote) setSelectedNote(undefined);
        else setSelectedNote(noteId);
    },
        [selectedNote]
    );

    /**
     * Map object with an array of Note components for each topic
     */
    const noteMap = useMemo(() => {
        if (!localNotes) return null;

        const elementMap = new Map<number, JSX.Element>();

        localNotes.forEach(note => {
            const newElement =
                <Note key={note.id}
                    selected={note.id === selectedNote}
                    setSelected={selectNote}
                    onEdit={editNote}
                    onDelete={deleteNote}
                    {...note} />

            elementMap.set(note.id, newElement);
        });

        // localNotes.forEach(note => {
        //     const newElement = (
        //         <Note key={note.id} selected={note.id === selectedNote} setSelected={selectNote} onEdit={editNote} onDelete={deleteNote} {...note} />
        //     );
        //     const existingNotes = elementMap.get(note.topicId);

        //     if (existingNotes) existingNotes.push(newElement);
        //     else elementMap.set(note.topicId, [newElement]);
        // });

        return elementMap;
    },
        [localNotes, selectedNote, selectNote, editNote, deleteNote]
    );

    /** Array of Topic components with their Note children */
    const topicAndNoteArray = useMemo(() => {
        if (!localTopics || !noteMap) return null;

        const topicArray: JSX.Element[] = [];

        localTopics.forEach((topic, topicId) => {
            const noteArray: JSX.Element[] = [];

            topic.noteOrder.forEach((noteId, ind) => {
                noteArray.push(
                    <Draggable
                        key={noteId}
                        draggableId={String(noteId)}
                        index={ind} >
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}>
                                {noteMap.get(noteId)}
                            </div>
                        )}
                    </Draggable>
                );
            });

            topicArray.push(
                <Droppable key={topicId} droppableId={String(topicId)}>
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            <Topic key={topicId}
                                id={topicId}
                                name={topic.name}
                                onEdit={renameTopic}
                                onDelete={deleteTopic} >
                                <CreateNote key={topicId} addNote={addNote} topicId={topicId} />
                                <div className='overflow-y-scroll h-full bar-sm'>
                                    {noteArray}
                                </div>
                            </Topic>
                        </div>
                    )}
                </Droppable>
            );
        });

        // localTopics.forEach((topic, topicId) => {
        //     const noteElements = noteMap.get(topicId);

        //     topicArray.push(
        //         <Droppable key={topicId} droppableId={String(topicId)}>
        //             {(provided, snapshot) => (
        //                 <div ref={provided.innerRef} {...provided.droppableProps}>
        //                     <Topic key={topicId}
        //                         id={topicId}
        //                         name={topic.name}
        //                         onEdit={renameTopic}
        //                         onDelete={deleteTopic} >
        //                         <CreateNote key={topicId} addNote={addNote} topicId={topicId} />
        //                         <div className='overflow-y-scroll h-full bar-sm'>
        //                             {noteElements}
        //                         </div>
        //                     </Topic>
        //                 </div>
        //             )}
        //         </Droppable>
        //     );
        // });

        return topicArray;
    },
        [localTopics, noteMap, deleteTopic, renameTopic, addNote]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className='flex flex-col flex-grow w-full bg-yellow-50 overflow-hidden'>
                <div className='mx-4 mt-2'>
                    <CreateTopic addTopic={addTopic} />
                </div>
                <div className='flex h-full flex-nowrap overflow-x-scroll flex-row px-2 pb-2'>
                    {topicAndNoteArray}
                </div>
            </div>
        </DragDropContext>
    );
}