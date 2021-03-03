import axios from 'axios';
import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import Logout from './Logout';
import Subjects from './Subjects';
import { ISubject } from './Interfaces';

function App() {

  const [noteData, setNoteData] = useState<ISubject[] | undefined>();
  const [loginStatus, setLoginStatus] = useState<boolean>(false);

  useEffect(() => {
    axios.get('/api/auth/login_status')
      .then(resp => {
        if (resp.status === 200) {
          setLoginStatus(resp.data);
        }
      })
      .catch(err => {
        console.log(err);
        alert('There was a problem connecting to the note server. The service may be down. Please try again later.');
      })
  }, []);

  useEffect(() => {
    if (loginStatus && !noteData) {
      axios.get('/api/note')
        .then(resp => {
          if (resp.status === 200) {
            setNoteData(resp.data);
            return;
          }
          else return;
        })
        .catch(err => {
          if (err.response.status === 401) return;
          else {
            alert('Something went wrong while fetching your notes. The service may be down. Please try again later.');
            return;
          }
        });
    }
    else if (!loginStatus && noteData) {
      setNoteData(undefined);
      return;
    }
    else return;

  }, [loginStatus, noteData]);

  return (
    <div>
      <LoginForm setLoginStatus={setLoginStatus} />
      <Logout setLoginStatus={setLoginStatus} />
      <br />
      <Subjects data={noteData} />
    </div>
  );
}

export default App;
