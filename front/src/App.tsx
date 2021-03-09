import axios from 'axios';
import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import Logout from './Logout';
import Subjects from './Subjects';
import { IUser } from './Interfaces';
import MainView from './MainView';

function App() {

  const [userData, setUserData] = useState<IUser | undefined>(undefined);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [currentSubject, setCurrentSubject] = useState<number | undefined>(undefined);

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

  // GET user data on login and clear memory on logout.
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
      setCurrentSubject(undefined);
      return;
    }
    else return;

  },
    [loginStatus, userData]
  );

  return (
    <div>
      {userData && `Welcome, ${userData.name}!`}
      {!loginStatus ? <LoginForm {...{ setLoginStatus }} /> :
        <Logout {...{ setLoginStatus }} />}
      <br />
      {loginStatus && <span>Select a Subject: <Subjects {...{ setCurrentSubject }} /></span>}
      <br />
      {currentSubject && <MainView subId={currentSubject} />}
    </div>
  );
}

export default App;
