import axios from 'axios';
import { useRef, useState } from 'react';

interface ILoginFormProps {
    setLoginStatus?: React.Dispatch<React.SetStateAction<boolean>>
}

/** Component for handling login/signup */
export default function LoginForm(props: ILoginFormProps): JSX.Element {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const loginRef = useRef<HTMLInputElement>(null);
    const signupRef = useRef<HTMLButtonElement>(null);

    /**
     * Attempt login
     * @param username Username
     * @param password Password
     */
    async function onLogin(username: string, password: string) {
        if (!username) {
            setMessage('Username required.');
            return;
        }
        if (!password) {
            setMessage('Password required.');
            return;
        }

        if (loginRef.current) loginRef.current.disabled = true;

        (async () => {
            const loggedIn = await axios.get('/api/auth/login_status')
                .then(resp => {
                    return resp.data as boolean;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });

            if (loggedIn) {
                setMessage('Already logged in. Log out before trying to log in again.');
                return;
            }

            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);
            axios.post('/api/auth/login', params)
                .then((resp) => {
                    if (resp.status === 200) {
                        setMessage('Login successful.');
                        if (props.setLoginStatus) props.setLoginStatus(true);
                    }
                    else setMessage('Something went wrong with your login attempt. Please try again later.');
                })
                .catch(err => {
                    if (err.response.status === 401) setMessage('Wrong username/password.');
                    else throw err;
                });

        })().catch(err => {
            console.log(err);
            setMessage('Something went wrong with your login attempt. Please try again later.');
            return;
        });

        if (loginRef.current) loginRef.current.disabled = false;
    }

    /**
     * Attempt signup. Login on success
     * @param username Username
     * @param password Password
     */
    async function onSignup(username: string, password: string) {
        if (!username) {
            setMessage('Username required.');
            return;
        }
        if (!password) {
            setMessage('Password required.');
            return;
        }

        const storedUsername = username;
        const storedPassword = password;

        if (signupRef.current) signupRef.current.disabled = true;

        axios.post(`/api/auth/signup`, {
            username: storedUsername,
            password: storedPassword
        })
            .then((resp) => {
                if (resp.status === 201) {
                    onLogin(storedUsername, storedPassword);
                }
                else setMessage('Something went wrong with your signup attempt. Please try again later.');
            })
            .catch(err => {
                if (err.response.status === 400) setMessage(err.response.data);
                else setMessage('Something went wrong with your signup attempt. Please try again later.');
            });

        if (signupRef.current) signupRef.current.disabled = false;
    }

    return (
        <div className='flex flex-wrap h-96 w-screen justify-center'>
            <div className='relative w-64 self-center font-sans px-8 pt-9 pb-14 bg-green-300 rounded-3xl shadow-lg'>
                <p className='text-xl pt-0.5'>
                    Welcome to Notator
                </p>
                <p className='float-right text-gray-600 text-sm'>
                    ver. 0.7
                </p>
                <form onSubmit={event => {
                    event.preventDefault();
                    onLogin(username, password);
                }}>
                    <div>
                        <input type='text'
                            className='w-full bg-green-100 focus:outline-none border-b-2 border-green-400 shadow-inner rounded-sm px-1 mt-1 mb-0.5'
                            placeholder='Username'
                            value={username}
                            onChange={(event) => setUsername(event.target.value)} />
                    </div>

                    <div>
                        <input type='password'
                            className='w-full bg-green-100 focus:outline-none border-b-2 border-green-400 shadow-inner rounded-sm px-1 mt-1 mb-0.5'
                            placeholder='Password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)} />
                    </div>

                    <div className='flex flex-row'>
                        <input className='flex-auto bg-green-200 focus:outline-none hover:bg-green-400 shadow-md rounded-sm py-0.5 my-2 cursor-pointer'
                            type='submit' value='Login' ref={loginRef} />
                        <button className='flex-auto bg-green-200 focus:outline-none hover:bg-green-400 shadow-md rounded-sm py-0.5 my-2 ml-1'
                            onClick={() => onSignup(username, password)} ref={signupRef}>
                            Signup
                        </button>
                    </div>
                </form>

                <p className='absolute italic pl-0.5'>
                    {message}
                </p>
            </div>
        </div>
    );
}