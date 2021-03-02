import axios from 'axios';

export default function Logout() {

    return (
        <button onClick={() => {
            axios.post('/api/auth/logout')
                .then(resp => {
                    if (resp.status === 200) return; // TODO, handle logout properly
                    else alert('Something went worng with your logout attempt. Please try again later.');
                })
                .catch(err => {
                    if (err.response.status === 400) alert(err.response.data);
                    else alert('Something went worng with your logout attempt. Please try again later.');
                });
        }}>
            Logout
        </button>
    );
}