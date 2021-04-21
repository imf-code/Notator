import axios from 'axios';
import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';
import Logout from './Logout';
import Subjects from './Subjects';
import { IUser } from './Interfaces';
import MainView from './MainView';
import Header from './Header';
import { CircularProgress, createMuiTheme, ThemeProvider } from '@material-ui/core';

function App() {

  const [userData, setUserData] = useState<IUser | undefined>(undefined);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [currentSubject, setCurrentSubject] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  // Attempt to get user data using existing session cookie
  useEffect(() => {
    axios.get('/api/user')
      .then(resp => {
        if (resp.status === 200) {
          setLoginStatus(true);
          setUserData(resp.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.response.status === 401) {
          setLoading(false);
          return;
        }
        else {
          console.log(err);
          alert('There was a problem connecting to the note server. The service may be down. Please try again later.');
          setLoading(false);
        }
      });
  },
    []
  );

  // GET user data on login and clear local user data on logout
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

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#047857',
      }
    },
  })

  return (
    <div className='flex flex-col h-screen bg-yellow-50 overflow-hidden'>
      <ThemeProvider theme={theme} >
        {loading && <div className='flex h-96 items-center justify-center'>
          <CircularProgress />
        </div>}
      </ThemeProvider>

      {!loginStatus ?
        (!loading && <LoginForm {...{ setLoginStatus }} />) :
        <Header name={userData?.name}>
          <Subjects {...{ setCurrentSubject }} />
          <Logout {...{ setLoginStatus }} />
        </Header>}

      {currentSubject && <MainView subId={currentSubject} />}

    </div>
  );
}

export default App;
