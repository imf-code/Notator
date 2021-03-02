import axios from 'axios';
import { useRef } from 'react';

interface ISignup {
    username: string,
    password: string,
    setMessage: React.Dispatch<React.SetStateAction<string>>
}

export default function Signup(props: ISignup): JSX.Element {
    const signupRef = useRef<HTMLButtonElement>(null);

    async function onSignup() {
        if (!props.username) {
            props.setMessage('Username required.');
            return;
        }
        if (!props.password) {
            props.setMessage('Password required.');
            return;
        }

        const username = props.username;
        const password = props.password;

        if (signupRef.current) signupRef.current.disabled = true;

        axios.post(`/api/auth/signup`, {
            user: username,
            pwd: password
        })
            .then((resp) => {
                if (resp.status === 201) {
                    props.setMessage(resp.data);

                    const params = new URLSearchParams();
                    params.append('username', username);
                    params.append('password', password);
                    axios.post(`/api/auth/login`, params)
                        .then((resp) => {
                            if (resp.status === 200) props.setMessage('Login successful.'); // TODO, handle login properly
                            else props.setMessage('Something went wrong with your login attempt. Please try again later.');
                        })
                        .catch(err => {
                            if (err.response.status === 401) props.setMessage('Wrong username/password.');
                            else props.setMessage('Something went wrong with your login attempt. Please try again later.');
                        });

                }
                else props.setMessage('Something went wrong with your signup attempt. Please try again later.');
            })
            .catch(err => {
                if (err.response.status === 400) props.setMessage(err.response.data);
                else props.setMessage('Something went wrong with your signup attempt. Please try again later.');
            });

        if (signupRef.current) signupRef.current.disabled = false;
    }

    return (
        <button onClick={onSignup} ref={signupRef}>
            Signup
        </button>
    );
}