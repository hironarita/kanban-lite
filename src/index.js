import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { get } from './utilities/Axios';

(async () => {
	const isLoggedIn = await get('/account/isLoggedIn');
	ReactDOM.render(
		<React.StrictMode>
			<App isLoggedIn={isLoggedIn}></App>
		</React.StrictMode>,
		document.getElementById('root')
	);
})();