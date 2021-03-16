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
    <div className='flex flex-col h-screen bg-yellow-50 overflow-hidden'>

      {loginStatus ?
        <div className='flex top-0 justify-between w-full h-11 pt-2 px-2 bg-green-300'>

          {userData && <div className='text-xl font-medium select-none cursor-pointer' onClick={() => window.location.reload()}>
            Notes of&nbsp;
            <span className='capitalize'>
              {userData.name}
            </span>
          </div>}

          <Subjects {...{ setCurrentSubject }} />

          <Logout {...{ setLoginStatus }} />

        </div> :

        <LoginForm {...{ setLoginStatus }} />}

      {currentSubject && <MainView subId={currentSubject} />}

    </div>
  );
}

export default App;