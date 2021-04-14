import axios from 'axios';
import { HeaderButton } from './Buttons.Header';

interface ILogout {
    setLoginStatus?: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Logout(props: ILogout) {

    return (
        <div>
            <HeaderButton
                onClick={() => {
                    axios.post('/api/auth/logout')
                        .then(resp => {
                            if (resp.status === 200) {
                                if (props.setLoginStatus) props.setLoginStatus(false);
                            }
                            else alert('Something went worng with your logout attempt. Please try again later.');
                        })
                        .catch(err => {
                            if (err.response.status === 400) alert(err.response.data);
                            else alert('Something went worng with your logout attempt. Please try again later.');
                        });
                }}>
                Logout
            </HeaderButton>
        </div>
    );
}