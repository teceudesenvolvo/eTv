import { createStore } from 'redux';
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { Reducers } from './reducers/index';


const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(persistConfig, Reducers)
const state = createStore(persistedReducer);
const persistor = persistStore(state);

export { state, persistor };