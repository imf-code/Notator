import axios from 'axios';
import React, { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import Logout from './Logout';
import Subjects from './Subjects';
import { IUser } from './Interfaces';

function App() {

  const [userData, setUserData] = useState<IUser | undefined>(undefined);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);

  // Check if user is currently logged in on server using session cookie.
  useEffect(() => {
    axios.get('/api/user')
      .then(resp => {
        if (resp.status === 200) {
          setLoginStatus(true);
          setUserData(resp.data);
        }
      })
      .catch(err => {
        if (err.response.status === 401) return;
        else {
          console.log(err);
          alert('There was a problem connecting to the note server. The service may be down. Please try again later.');
        }
      })
  }, []);

  // GET notes when user logs in and clear notes from local memory on logout.
  useEffect(() => {
    if (loginStatus && !userData) {
      axios.get('/api/user')
        .then(resp => {
          if (resp.status === 200) {
            setUserData(resp.data);
            return;
          }
        })
        .catch(err => {
          if (err.response.status === 401) return;
          else {
            alert('Something went wrong while fetching your user data. The service may be down. Please try again later.');
            return;
          }
        });
    }
    else if (!loginStatus && userData) {
      setUserData(undefined);
      return;
    }
    else return;

  },
    [loginStatus, userData]
  );

  return (
    <div>
      {userData && `Hello, user ${userData.name}`}
      <LoginForm setLoginStatus={setLoginStatus} />
      <Logout setLoginStatus={setLoginStatus} />
      <br />
      {loginStatus && <Subjects />}
    </div>
  );
}

export default App;
