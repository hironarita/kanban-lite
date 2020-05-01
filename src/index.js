import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import App from './App';

(async () => {
	const response = await axios.get('http://localhost:3000/account/isLoggedIn', { withCredentials: true });
	ReactDOM.render(
		<React.StrictMode>
			<App isLoggedIn={response.data}></App>
		</React.StrictMode>,
		document.getElementById('root')
	);
})();