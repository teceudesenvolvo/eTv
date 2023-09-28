import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './screens/App';

import { state, persistor } from "./store";

import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'
import {BrowserRouter} from 'react-router-dom'


import * as serviceWorker from './serviceWorker';

import axios from 'axios'
// axios.defaults.baseURL = 'https://eu-desenvolvo-default-rtdb.firebaseio.com/'
// axios.defaults.baseURL = 'https://e-tv-camara-default-rtdb.firebaseio.com'
axios.defaults.baseURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCpJGW2RIDoOZ6-Dq3QgTVEg&key=AIzaSyCfZfFR3QzWmQWBYMgwmXx8n2EdyjdFi2s&type=video'

ReactDOM.render(

<Provider store={state}>
    <PersistGate persistor={persistor} loading={null} >
        <BrowserRouter>
            <App />
        </BrowserRouter> 
    </PersistGate>
</Provider>
, document.getElementById('root'));

serviceWorker.unregister();
