import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ISubject } from './Interfaces';
import CreateSubject from './Subject.Create';
import EditSubject from './Subject.Edit';
import HeaderButton from './HeaderButtons';

interface ISubjectsProps {
    /** Set currently selected subject. */
    setCurrentSubject: React.Dispatch<React.SetStateAction<number | undefined>>
}

/**
 * Component for displaying, selecting and manipulating subjects.
 */
export default function Subjects(props: ISubjectsProps) {

    const [localSubjects, setLocalSubjects] = useState<ISubject[] | undefined>(undefined);
    const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
    const [subject, setSubject] = useState<ISubject | undefined>(undefined);
    const [edit, setEdit] = useState<boolean>(false);
    const [create, setCreate] = useState<boolean>(false);

    // Get list of subjects from API
    useEffect(() => {
        axios.get('/api/subject/all')
            .then(resp => {
                if (resp.status === 200) {
                    setLocalSubjects(resp.data);
                }
            })
            .catch(err => {
                console.log(err);
                alert('There was a problem retrieving your subject list. Please try again later.');
            });
    },
        []
    );

    // Send currently selected subject ID upstream
    useEffect(() => {
        if (!subjectId) props.setCurrentSubject(undefined);
        else props.setCurrentSubject(subjectId);
    },
        [subjectId, props]
    );

    // Find currently selected subject for internal use
    useEffect(() => {
        if (!subjectId || !localSubjects || !localSubjects.length) return;

        const currentSubject = localSubjects.find(subject => {
            return subject.id === subjectId;
        });

        if (currentSubject) setSubject(currentSubject);
        else setSubject(undefined);
    },
        [subjectId, localSubjects]
    );

    function cancelEdit() {
        setEdit(false);
        return;
    }

    /**
     * Create a new Subject
     * @param name Name of the new subject.
     */
    async function addSubject(name: string) {
        if (!localSubjects) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const apiResponse = axios.post('/api/subject', {
            subject: name
        }).then(resp => {
            if (resp.status === 201) return resp.data[0].id as number;
            else throw new Error();
        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert(err.response.data);
            else alert('There was an error while attempting to create a new subject. Please try again later.');
            return null;
        });


        const newId = await apiResponse;

        if (newId === null) return;
        else if (newId) {

            const newSubject: ISubject = {
                id: newId,
                name: name,
                topics: [],
                topicOrder: ''
            }

            setCreate(false);
            setLocalSubjects([newSubject, ...localSubjects,]);
            setSubjectId(newId);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /**
     * Rename a subject
     * @param subId ID of subject to be renamed
     * @param newName New name for the subject
     */
    async function renameSubject(subId: number, newName: string) {
        if (!localSubjects) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const apiResponse = axios.patch(`/api/subject/${subId}`, {
            name: newName
        }).then(resp => {
            if (resp.status === 200) return resp.data.id as number;
            else {
                throw new Error();
            }
        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert(err.response.data);
            else alert('There was an error while attempting to rename the subject. Please try again later.');
            return null;
        });

        const newLocalSubjects = localSubjects.map(subject => {
            return subject.id === subId ? { ...subject, name: newName } : subject;
        });

        const editedId = await apiResponse;

        if (editedId === null) return;
        else if (editedId === subId) {
            setLocalSubjects(newLocalSubjects);
            setEdit(false);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /**
     * Delete a subject
     * @param subId ID of subject to be deleted
     */
    async function deleteSubject(subId: number | undefined) {
        if (!localSubjects) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }
        if (!subId) return;

        const apiResponse = axios.delete(`/api/subject/${subId}`)
            .then(resp => {
                if (resp.status === 200) return resp.data.id as number;
                else throw new Error();
            }).catch(err => {
                console.log(err);
                if (err.response.status === 400) alert(err.response.data);
                else alert('There was an error while attempting to delete the subject. Please try again later.');
                return null;
            });

        const newLocalSubjects = localSubjects.filter(subject => {
            return subject.id !== subId;
        });

        const deletedId = await apiResponse;

        if (deletedId === null) return;
        else if (deletedId === subId) {
            setLocalSubjects(newLocalSubjects);
            setSubjectId(undefined);
        }
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /** Current subjects as an array of HTML option elements */
    const optionArray = useMemo(() => {
        if (!localSubjects) return null;

        return localSubjects.map((subject) => {
            return (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
            );
        })
    },
        [localSubjects]
    );


    return (
        <span className='flex flex-nowrap justify-start w-3/5 h-auto'>
            {(!edit && !create) &&
                <select className='w-52 h-7 mx-0.5 focus:outline-none rounded-sm shadow-inner bg-green-100'
                    value={subjectId ?? 'default'}
                    onChange={(event) => setSubjectId(Number(event.target.value))}>
                    <option key={'default'} value='default' disabled>
                        Select a subject...
                    </option>
                    {optionArray}
                </select>}

            {create && <CreateSubject {...{ addSubject }} />}

            {(edit && subject) &&
                <EditSubject
                    onEdit={renameSubject}
                    cancelEdit={cancelEdit}
                    id={subject.id}
                    name={subject.name}
                />}

            {!edit &&
                <HeaderButton
                    onClick={() => setCreate(!create)}>
                    {create ? 'Cancel' : 'Add'}
                </HeaderButton>}

            {((!create && !edit)) &&
                <HeaderButton onClick={() => setEdit(true)} disabled={typeof subjectId === 'number' ? false : true}>
                    Edit
                </HeaderButton>}

            <HeaderButton onClick={() => deleteSubject(subjectId)}>
                Delete
            </HeaderButton>
        </span >
    );
}