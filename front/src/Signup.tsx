import { useState } from 'react';

export default function Signup(): JSX.Element {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    function onSubmit() {
        if (!username) {
            setMessage('Username required.');
            return;
        }
        if (!password) {
            setMessage('Password required.');
            return;
        }


    }

    return (
        <div>
            <div>
                <input type='text' id='username_input'
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}>
                </input>
            </div>

            <div>
                <input type='password' id='password_input'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}>
                </input>
            </div>

            <div>
                <button id='signup'
                    onClick={() => onSubmit()}>
                    Submit
                </button>
            </div>

            <div>
                {message}
            </div>
        </div>
    );
}