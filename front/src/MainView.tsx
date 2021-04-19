import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

import { INote, ISubject, ITopic } from './Interfaces';
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
    const [topicOrder, setTopicOrder] = useState<number[] | undefined>(undefined);

    // GET Topics and Notes and turn them into Map objects for internal use
    useEffect(() => {
        (async () => {
            const apiResponse = axios.get(`/api/subject/${props.subId}/with-notes`)
                .then(resp => {
                    if (resp.status !== 200) {
                        console.log(resp);
                        alert('Something went wrong while retrieving your list of topics. Please try again later.');
                        return undefined;
                    }
                    else {
                        return resp.data as ISubject;
                    }
                }).catch(err => {
                    console.log(err.response.data);
                    alert('Something went wrong while retrieving your list of topics. Please try again later.');
                    return undefined;
                });

            const subject: ISubject | undefined = await apiResponse;
            if (!subject) return;

            const topicsAndNotes: ITopic[] | undefined = subject.topics;
            if (!topicsAndNotes) return;

            const newTopics = new Map<number, ITopicWithOrder>();
            const newNotes = new Map<number, INoteWithTopic>();

            topicsAndNotes.forEach(topic => {
                newTopics.set(topic.id, { name: topic.name, noteOrder: JSON.parse(topic.noteOrder) as number[] });
                topic.notes.forEach(note => {
                    newNotes.set(note.id, { ...note, topicId: topic.id } as INoteWithTopic);
                });
            });

            const newTopicOrder = JSON.parse(subject.topicOrder) as number[];

            setTopicOrder(newTopicOrder);
            setLocalTopics(newTopics);
            setLocalNotes(newNotes);

        })();
    },
        [props.subId]
    )

    /**
     * Create a new topic under currently selected subject
     * @param name Name of the new topic to be created
     */
    async function createTopic(name: string) {
        if (!localTopics || !topicOrder) {
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

        if (!newId) return;

        const newTopics = new Map(localTopics);
        newTopics.set(newId, { name: name, noteOrder: [] });

        setTopicOrder([newId, ...topicOrder]);
        setLocalTopics(newTopics);

        axios.patch(`/api/subject/order/${props.subId}`, {
            order: JSON.stringify([newId, ...topicOrder])
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        });
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
        if (!localTopics || !topicOrder) {
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

        if (!deletedTopic) return;
        else if (deletedTopic === topicId) {

            const newTopicOrder = topicOrder.filter(topic => topic !== topicId);

            setTopicOrder(newTopicOrder);

            axios.patch(`/api/subject/order/${props.subId}`, {
                order: JSON.stringify(newTopicOrder)
            }).then(resp => {
                if (resp.status === 200) return;
                else throw new Error();
            }).catch(err => {
                console.log(err);
                if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
                else alert('Something went wrong. The service may be down. Please try again later.');
            });
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localTopics, props.subId, topicOrder]
    );

    /**
     * Create a new note under provided topic
     * @param topicId ID of the parent topic
     * @param text Text for the new note
     */
    const createNote = useCallback(async (topicId: number, text: string) => {
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
        });
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
        if (!localNotes || !localTopics) {
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
        const removed = newNotes.get(noteId);
        newNotes.delete(noteId);

        const newTopics = new Map(localTopics);

        if (!removed) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        };

        const topic = newTopics.get(removed.topicId);

        if (!topic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        };

        const newOrder = topic.noteOrder.filter(note => note !== noteId);
        newTopics.set(removed.topicId, { name: topic.name, noteOrder: newOrder });

        setLocalTopics(newTopics);
        setLocalNotes(newNotes);

        const deletedNote = await apiResponse;

        if (!deletedNote) return;
        else if (deletedNote === noteId) {
            axios.patch(`/api/topic/order/${removed.topicId}`, {
                order: JSON.stringify(newOrder)
            }).then(resp => {
                if (resp.status === 200) return;
                else throw new Error();
            }).catch(err => {
                console.log(err);
                if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
                else alert('Something went wrong. The service may be down. Please try again later.');
            });
        }
        else alert('Something went wrong. Please try refreshing the page.');
    },
        [localNotes, localTopics]
    );

    /**
    * Move a note to another topic
    * @param sTopicId ID of source topic
    * @param dTopicId ID of destination topic
    * @param startInd Array index of movind note
    * @param endInd Destination array index
    */
    const moveNote = useCallback(async (sTopicId: number, dTopicId: number, startInd: number, endInd: number) => {
        if (!localNotes || !localTopics) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newLocalTopics = new Map(localTopics);
        const newLocalNotes = new Map(localNotes);

        const sTopic = newLocalTopics.get(sTopicId);
        const dTopic = newLocalTopics.get(dTopicId);

        if (!sTopic || !dTopic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const sNewNoteOrder = [...sTopic.noteOrder];
        const dNewNoteOrder = [...dTopic.noteOrder];

        const [noteId] = sNewNoteOrder.splice(startInd, 1);
        dNewNoteOrder.splice(endInd, 0, noteId);

        newLocalTopics.set(sTopicId, { ...sTopic, noteOrder: sNewNoteOrder });
        newLocalTopics.set(dTopicId, { ...dTopic, noteOrder: dNewNoteOrder });

        // TODO: Rework moving note into a single API call
        const apiResponse = axios.patch(`/api/note/move/${noteId}`, {
            topicId: dTopicId,
            noteId: noteId
        }).then(resp => {
            if (resp.status === 200) return resp.data.id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('Something went wrong while editing the note. Please try again later.');
            return;
        });

        axios.patch(`/api/topic/order/${sTopicId}`, {
            order: JSON.stringify(sNewNoteOrder)
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        });

        axios.patch(`/api/topic/order/${dTopicId}`, {
            order: JSON.stringify(dNewNoteOrder)
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        });

        const oldNote = newLocalNotes.get(noteId);

        if (!oldNote) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newNote = { ...oldNote, topicId: dTopicId } as INoteWithTopic;
        newLocalNotes.set(noteId, newNote);

        setLocalNotes(newLocalNotes);
        setLocalTopics(newLocalTopics);

        const movedNote = await apiResponse;

        if (!movedNote || movedNote === noteId) return;
        else {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }
    },
        [localNotes, localTopics]
    );

    /**
     * Moves a note within a topic
     * @param topicId ID of the topic to be reorganized
     * @param startInd Array index of the note to be moved
     * @param endInd Destination array index
     */
    const reorderNotes = useCallback(async (topicId: number, startInd: number, endInd: number) => {
        if (!localTopics) return;

        const topic = localTopics.get(topicId);

        if (!topic) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const newNoteOrder = [...topic.noteOrder];

        const [movingNoteId] = newNoteOrder.splice(startInd, 1);
        newNoteOrder.splice(endInd, 0, movingNoteId);

        const newTopics = new Map(localTopics);

        newTopics.set(topicId, { name: topic.name, noteOrder: newNoteOrder });

        setLocalTopics(newTopics);

        axios.patch(`/api/topic/order/${topicId}`, {
            order: JSON.stringify(newNoteOrder)
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        });
    },
        [localTopics]
    );

    /**
     * Moves a topic
     * @param startInd Array index of the topic to be moved
     * @param endInd Destination array index
     */
    const reorderTopics = useCallback(async (startInd: number, endInd: number) => {
        if (!topicOrder) return;

        const newTopicOrder = [...topicOrder];

        const [movingNoteId] = newTopicOrder.splice(startInd, 1);
        newTopicOrder.splice(endInd, 0, movingNoteId);

        setTopicOrder(newTopicOrder);

        axios.patch(`/api/subject/order/${props.subId}`, {
            order: JSON.stringify(newTopicOrder)
        }).then(resp => {
            if (resp.status === 200) return;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response && err.response.status === 400) alert('Something went wrong. Please try refreshing the page.');
            else alert('Something went wrong. The service may be down. Please try again later.');
        });
    },
        [topicOrder, props.subId]
    );

    /** Drag end handler */
    const onDragEnd = useCallback((result: DropResult) => {

        const { source, destination, type } = result;

        if (!destination) return;

        switch (type) {
            case 'NOTE':
                const sTopicId = +source.droppableId;
                const dTopicId = +destination.droppableId;

                if (sTopicId === dTopicId) {
                    reorderNotes(sTopicId, source.index, destination.index);
                    return;
                }
                else moveNote(sTopicId, dTopicId, source.index, destination.index);
                break;
            case 'TOPIC':
                reorderTopics(source.index, destination.index);
                break;
            default: return;
        }
    },
        [reorderNotes, reorderTopics, moveNote]
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
     * A Map object with a Note component for each note
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

        return elementMap;
    },
        [localNotes, selectedNote, selectNote, editNote, deleteNote]
    );

    /** Array of Topic components with their Note children, 
     * incl. Draggable/Droppable functionality
    */
    const topicAndNoteArray = useMemo(() => {
        if (!localTopics || !noteMap || !topicOrder) return null;

        /**
         * A Map object of Topic components, 
         * incl. Note children
         */
        const topicMap = new Map<number, JSX.Element>();

        // Iterate through each topic
        localTopics.forEach((topic, topicId) => {

            /**
             * Array of Note components with added Draggable functionality,
             * in correct order
             */
            const orderedNoteArray: JSX.Element[] = topic.noteOrder.map((noteId, ind) => {
                return (
                    <Draggable
                        key={noteId}
                        draggableId={String(noteId)}
                        index={ind} >
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}>
                                {noteMap.get(noteId)}
                            </div>)}
                    </Draggable>
                );
            });

            // Set a Topic component in Map with added Droppable functionality
            topicMap.set(topicId,
                <Topic key={topicId}
                    id={topicId}
                    name={topic.name}
                    onEdit={renameTopic}
                    onDelete={deleteTopic}
                    index={topicOrder.indexOf(topicId)} >

                    <CreateNote key={topicId} addNote={createNote} topicId={topicId} />

                    <Droppable key={'drop' + topicId} droppableId={String(topicId)} type='NOTE'>
                        {(provided, snapshot) => (

                            <div className='overflow-y-scroll overflow-x-hidden h-full bar-sm'
                                ref={provided.innerRef}
                                {...provided.droppableProps} >

                                {orderedNoteArray}
                                {provided.placeholder}
                            </div>)}
                    </Droppable>

                </Topic>
            );
        });

        /**
         * Array of Topic components in the right order
         */
        const topicArray: JSX.Element[] = topicOrder.map((topicId) => {
            return topicMap.get(topicId) ?? <></>;
        });

        return topicArray;
    },
        [localTopics, topicOrder, noteMap, deleteTopic, renameTopic, createNote]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className='flex flex-col flex-grow w-full bg-yellow-50 overflow-hidden'>

                <div className='mx-4 mt-2'>
                    <CreateTopic addTopic={createTopic} />
                </div>

                <Droppable key='topics' droppableId='topics' type='TOPIC' direction='horizontal'>
                    {(provided, snapshot) => (
                        <div className='flex h-full flex-nowrap overflow-x-scroll overflow-y-hidden flex-row px-2 pb-2'
                            ref={provided.innerRef}
                            {...provided.droppableProps}>

                            {topicAndNoteArray}
                            {provided.placeholder}

                        </div>)}
                </Droppable>

            </div>
        </DragDropContext>
    );
}