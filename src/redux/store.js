import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reducer } from './reducer';

const myStore = createStore(reducer, applyMiddleware(thunk));

export default myStore;