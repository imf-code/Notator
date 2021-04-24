import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { ISubject } from './Interfaces';
import CreateSubject from './Subject.Create';
import EditSubject from './Subject.Edit';
import { HeaderButton } from './Buttons.Header';

interface ISubjectsProps {
    /** Set currently selected subject */
    setCurrentSubject: React.Dispatch<React.SetStateAction<number | undefined>>
}

/**
 * Component for selecting and manipulating subjects
 */
export default function Subjects(props: ISubjectsProps) {

    const [localSubjects, setLocalSubjects] = useState<ISubject[] | undefined>(undefined);
    const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
    const [subject, setSubject] = useState<ISubject | undefined>(undefined);

    const [edit, setEdit] = useState<boolean>(false);
    const [create, setCreate] = useState<boolean>(false);
    const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

    // Get list of subjects from API
    useEffect(() => {
        axios.get('/api/subject/all')
            .then(resp => {
                if (resp.status === 200) {
                    setLocalSubjects(resp.data);
                }
                else throw new Error();
            })
            .catch(err => {
                console.log(err);
                alert('There was a problem retrieving your subject list. The service may be down. Please try again later.');
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

    // Find the currently selected subject (for internal use in this component only)
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

    // Cancel editing
    function cancelEdit() {
        setEdit(false);
        return;
    }

    // Cancel delete confirmation when subject is changed
    useEffect(() => {
        setDeleteConfirm(false);
    },
        [subjectId]
    );

    /**
     * Create a new Subject
     * @param name Name of the new subject
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
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('There was an error while attempting to create a new subject. Please try again later.');
            return undefined;
        });


        const newId = await apiResponse;

        if (typeof newId === 'number') {

            const newSubject: ISubject = {
                id: newId,
                name: name,
                topics: [],
                topicOrder: ''
            }

            setCreate(false);
            setLocalSubjects([newSubject, ...localSubjects]);
            setSubjectId(newId);
        }
        else if (newId === undefined) return;
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /**
     * Rename a subject
     * @param subId ID of subject to be renamed
     * @param newName New name for the subject
     */
    async function renameSubject(subId: number, newName: string) {
        if (!localSubjects || !subId) {
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
            if (err.response && err.response.status === 400) alert(err.response.data);
            else alert('There was an error while attempting to rename the subject. Please try again later.');
            return undefined;
        });

        const newLocalSubjects = localSubjects.map(subject => {
            return subject.id === subId ? { ...subject, name: newName } : subject;
        });

        setLocalSubjects(newLocalSubjects);
        setEdit(false);

        const editedId = await apiResponse;

        if (editedId === subId || editedId === undefined) return;
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /**
     * Delete a subject
     * @param subId ID of subject to be deleted
     */
    async function deleteSubject(subId: number | undefined) {
        if (!localSubjects || !subId) {
            alert('Something went wrong. Please try refreshing the page.');
            return;
        }

        const apiResponse = axios.delete(`/api/subject/${subId}`)
            .then(resp => {
                if (resp.status === 200) return resp.data.id as number;
                else throw new Error();
            }).catch(err => {
                console.log(err);
                if (err.response && err.response.status === 400) alert(err.response.data);
                else alert('There was an error while attempting to delete the subject. Please try again later.');
                return undefined;
            });

        const newLocalSubjects = localSubjects.filter(subject => {
            return subject.id !== subId;
        });

        setLocalSubjects(newLocalSubjects);
        setSubjectId(undefined);

        const deletedId = await apiResponse;

        if (deletedId === subId || deletedId === undefined) return;
        else alert('Something went wrong. Please try refreshing the page.');
    }

    /** List of current subjects as an array of HTML option elements */
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
        <div className='flex flex-nowrap justify-start w-3/5 h-auto'>

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
                    onClick={() => setCreate(!create)}
                    disabled={!localSubjects}>
                    {create ? 'Cancel' : 'Create'}
                </HeaderButton>}

            {(!create && !edit) &&
                <HeaderButton
                    onClick={() => setEdit(true)}
                    disabled={!(typeof subjectId === 'number')}>
                    Edit
                </HeaderButton>}

            <HeaderButton
                onClick={() => setDeleteConfirm(true)}
                disabled={!(typeof subjectId === 'number')}>
                Delete
            </HeaderButton>

            {deleteConfirm &&
                <div className='flex flex-nowrap'>
                    &nbsp;Are you sure?&nbsp;
                    <div className='underline cursor-pointer'
                        onClick={() => deleteSubject(subjectId)}>Yes</div>
                    &nbsp;-&nbsp;
                    <div className='underline cursor-pointer'
                        onClick={() => setDeleteConfirm(false)}>Cancel</div>
                </div>}
        </div >
    );
}