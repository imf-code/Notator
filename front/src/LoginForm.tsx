import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface ILoginForm {

}

export default function LoginForm(props: ILoginForm): JSX.Element {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

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
                <Login username={username} password={password} setMessage={setMessage} />
                <Signup username={username} password={password} setMessage={setMessage} />
            </div>

            <div>
                {message}
            </div>
        </div>
    );
}