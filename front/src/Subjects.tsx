import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ISubject } from './Interfaces';
import Topics from './Topics';
import Subject from './Subject';

interface ISubjectsProps {
    data: ISubject[] | undefined;
}

/**
 * Component for displaying, selecting and manipulating subjects and the topics/notes under selected subject.
 */
export default function Subjects(props: ISubjectsProps) {

    const [currentSubject, setCurrentSubject] = useState<ISubject | undefined>(undefined);
    const [localSubjects, setLocalSubjects] = useState<ISubject[] | undefined>(undefined);
    const [newSubject, setNewSubject] = useState<string>('');

    useEffect(() => {
        if (!props.data) return;
        else setLocalSubjects(props.data);
    }, [props.data]);

    function addSubject(name: string) {
        axios.post('/api/subject', {
            subject: name
        }).then(resp => {
            if (!localSubjects) return;

            const newId = Number(resp.data[0].id);
            const createdSubject: ISubject = {
                id: newId,
                name: name,
                topics: []
            }

            setLocalSubjects([...localSubjects, createdSubject]);

        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert('A name for new subject is required.');
            else alert('There was an error while attempting to create a new subject. Please try again later.');
        });
    }

    const renameSubject = useCallback(async (id: number, newName: string) => {
        axios.patch('/api/subject', {
            subId: id,
            name: newName
        }).then(resp => {
            if (resp.status === 200) {
                if (!localSubjects) {
                    alert('There was an error while attempting to rename the subject. Please try refreshing the page.');
                    return;
                }

                const newLocalSubjects = localSubjects.map(subject => {
                    return subject.id === id ? { ...subject, name: newName } : subject;
                });

                setLocalSubjects(newLocalSubjects);
            }
        }).catch(err => {
            console.log(err);
            if (err.response.status === 400) alert('Name for the subject is required.');
            else alert('There was an error while attempting to rename the subject. Please try again later.');
        });
    },
        [localSubjects]
    );

    const deleteSubject = useCallback(async (id: number) => {
        axios.delete('/api/subject', {
            data: {
                subId: id
            }
        }).then(resp => {
            if (resp.status !== 200) {
                throw new Error();
            }

            if (!localSubjects) {
                alert('There was an error while attempting to delete the subject. Please try refreshing the page.');
                return;
            }

            const newLocalSubjects = localSubjects.filter(subject => {
                return subject.id !== id;
            });

            setLocalSubjects(newLocalSubjects);

        }).catch(err => {
            console.log(err);
            alert('There was an error while attempting to delete the subject. Please try again later.');
        });
    },
        [localSubjects]
    );

    const subjectElements = useMemo(() => {
        if (!localSubjects) return null;

        return localSubjects.map((subject) => {
            return (
                <Subject key={subject.id}
                    data={subject}
                    onEdit={renameSubject}
                    setCurrentSubject={setCurrentSubject}
                    onDelete={deleteSubject} />
            );
        })
    }, [localSubjects, renameSubject, deleteSubject]);


    return (
        <div>
            <form onSubmit={event => {
                event.preventDefault();
                addSubject(newSubject);
            }}>
                <input type='text'
                    value={newSubject}
                    onChange={event => setNewSubject(event.target.value)}
                    placeholder='Add new subject...' />
                <input type='submit' value='Add' />
            </form>
            {subjectElements}
            {currentSubject && <Topics data={currentSubject} />}
        </div>
    );
}

