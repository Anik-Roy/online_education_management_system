import * as actionTypes from './actionTypes';

const INITIAL_STATE = {
    token: null,
    userId: null,
    authLoading: false,
    authFailedMessage: null,
}

export const reducer = (state=INITIAL_STATE, action) => {
   
    switch(action.type) {     
        // auth cases
        case actionTypes.AUTH_SUCCESS:
            return {
                ...state,
                token: action.payload.token,
                userId: action.payload.userId,
            }
        
        case actionTypes.AUTH_LOGOUT:
            return {
                ...state,
                token: null,
                userId: null,
                authFailedMessage: null,
            }
        
        case actionTypes.AUTH_LOADING:
            return {
                ...state,
                authLoading: action.payload,
            }
        
        case actionTypes.AUTH_FAILED:
            return {
                ...state,
                authFailedMessage: action.payload,
            }
        default:
            return state;
    }
}