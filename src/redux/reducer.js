import * as actionTypes from './actionTypes';

const INITIAL_STATE = {
    token: null,
    userId: null,
    authLoading: false,
    authFailedMessage: null,

    isCreteClassModalOpen: false,
    isJoinClassModalOpen: false,
    isUnenrollClassModalOpen: false,

    isCreateClassLoading: false,
    isJoinClassLoading: false,
    fetchClassLoading: false,

    joinClassFailedMsg: "",
    joinedAlreadyMsg: "",
    fetchClassErrorMsg: "",

    selectedClassToUnenroll: null,
    unenrollClassSuccessMsg: "",
    unenrollClassErrorMsg: "",

    unenrollClassLoading: false,

    classes: [],
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

        case actionTypes.TOOGLE_CREATE_CLASS_MODAL:
            return {
                ...state,
                isCreteClassModalOpen: !state.isCreteClassModalOpen
            }
          
        case actionTypes.TOOGLE_JOIN_CLASS_MODAL:
            return {
                ...state,
                isJoinClassModalOpen: !state.isJoinClassModalOpen
            }
        
        case actionTypes.TOOGLE_UNENROLL_CLASS_MODAL:
            return {
                ...state,
                isUnenrollClassModalOpen: !state.isUnenrollClassModalOpen
            }

        case actionTypes.CREATE_CLASS_LOADING:
            return {
                ...state,
                isCreateClassLoading: action.payload
            }
        
        case actionTypes.CREATE_CLASS_SUCCESS:
            return {
                ...state,
                isCreteClassModalOpen: false
            }

        case actionTypes.JOIN_CLASS_LOADING:
            return {
                ...state,
                isJoinClassLoading: action.payload
            }

        case actionTypes.JOIN_CLASS_SUCCESS:
            return {
                ...state,
                isJoinClassLoading: false,
                joinClassFailedMsg: "",
                classes: state.classes.concat(action.payload)
            }
        
        case actionTypes.JOIN_CLASS_FAILED:
            return {
                ...state,
                isJoinClassLoading: false,
                joinClassFailedMsg: action.payload
            }
        
        case actionTypes.JOINED_ALREADY:
            return {
                ...state,
                joinedAlreadyMsg: action.payload
            }

        case actionTypes.FETCH_CLASS_LOADING:
            return {
                ...state,
                fetchClassLoading: action.payload
            }

        case actionTypes.FETCH_CLASS_SUCCESS:
            return {
                ...state,
                classes: action.payload
            }
        
        case actionTypes.FETCH_CLASS_ERROR:
            return {
                ...state,
                fetchClassErrorMsg: action.payload
            }
        
        case actionTypes.SELECTED_CLASS_TO_UNENROLL:
            return {
                ...state,
                selectedClassToUnenroll: action.payload
            }
            
        case actionTypes.UNENROLL_CLASS_LOADING:
            return {
                ...state,
                unenrollClassLoading: action.payload
            }
        
        case actionTypes.UNENROLL_CLASS_SUCCESS:
            return {
                ...state,
                unenrollClassLoading: false,
                unenrollClassSuccessMsg: action.payload.msg,
                unenrollClassErrorMsg: "",
                classes: state.classes.filter(cls => cls.key !== action.payload.id)
            }
        
        case actionTypes.UNENROLL_CLASS_FAILED:
            return {
                ...state,
                unenrollClassLoading: false,
                unenrollClassSuccessMsg: "",
                unenrollClassErrorMsg: action.payload,
            }
        default:
            return state;
    }
}