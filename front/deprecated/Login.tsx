import { useRef } from 'react';
import axios from 'axios';

interface ILogin {
    username: string,
    password: string,
    setMessage: React.Dispatch<React.SetStateAction<string>>,
    setLoginStatus?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Login(props: ILogin): JSX.Element {
    const loginRef = useRef<HTMLInputElement>(null);

    async function onLogin() {
        if (!props.username) {
            props.setMessage('Username required.');
            return;
        }
        if (!props.password) {
            props.setMessage('Password required.');
            return;
        }

        if (loginRef.current) loginRef.current.disabled = true;

        const params = new URLSearchParams();
        params.append('username', props.username);
        params.append('password', props.password);
        axios.post(`/api/auth/login`, params)
            .then((resp) => {
                if (resp.status === 200) {
                    props.setMessage('Login successful.');
                    if (props.setLoginStatus) props.setLoginStatus(true);
                }
                else props.setMessage('Something went wrong with your login attempt. Please try again later.');
            })
            .catch(err => {
                if (err.response.status === 401) props.setMessage('Wrong username/password.');
                else props.setMessage('Something went wrong with your login attempt. Please try again later.');
            });

        if (loginRef.current) loginRef.current.disabled = false;
    }

    return (
        <input type='submit' onClick={onLogin} ref={loginRef}>
            Login
        </input>
    );
}