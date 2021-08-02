import * as actionTypes from './actionTypes';

const INITIAL_STATE = {
    token: null,
    userId: null,
    userProfile: {},
    authLoading: false,
    authFailedMessage: '',

    isCreteClassModalOpen: false,
    isJoinClassModalOpen: false,
    isUnenrollClassModalOpen: false,

    isCreateClassLoading: false,
    isJoinClassLoading: false,
    fetchClassLoading: false,
    fetchClassContentsLoading: false,
    fetchSingleClassLoading: false,
    addClassContentLoading: false,
    addClassCommentLoading: false,
    fetchClassCommentsLoading: false,
    fetchClassStudentsLoading: false,
    deleteClassContentLoading: false,
    deleteCommentFromContentLoading: false,
    fetchQuizesLoading: false,
    quizSubmissionLoading: false,
    fetchQuizResponsesLoading: false,

    joinClassFailedMsg: "",
    joinedAlreadyMsg: "",
    fetchClassErrorMsg: "",
    fetchSingleClassErrorMsg: "",
    addClassContentSuccessMsg: "",
    addClassContentErrorMsg: "",
    fetchClassStudentsErrorMsg: "",
    deleteClassContentSuccessMsg: "",
    deleteClassContentErrorMsg: "",

    selectedClassToUnenroll: null,
    unenrollClassSuccessMsg: "",
    unenrollClassErrorMsg: "",

    quizSubmissionSuccessMsg: "",
    quizSubmissionErrorMsg: "",

    fetchQuizResponsesSuccessMsg: "",
    fetchQuizResponsesErrorMsg: "",

    fetchUserProfileLoading: false,
    
    unenrollClassLoading: false,

    showCommentPostingIndicator: null,

    classDetails: null,
    classes: [],
    classContents: [],
    classComments: [],
    classStudents: [],

    classQuizes: [],

    quizResponses: []
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
                authFailedMessage: '',
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
        
        case actionTypes.FETCH_SINGLE_CLASS_LOADING:
            return {
                ...state,
                fetchSingleClassLoading: action.payload
            }
        
        case actionTypes.FETCH_SINGLE_CLASS_ERROR:
            return {
                ...state,
                fetchSingleClassErrorMsg: action.payload
            }
        
        case actionTypes.FETCH_SINGLE_CLASS:
            return {
                ...state,
                classDetails: action.payload
            }
        
        case actionTypes.ADD_CLASS_CONTENT_LOADING:
            return {
                ...state,
                addClassContentLoading: action.payload
            }
        
        case actionTypes.ADD_CLASS_CONTENT:
            return {
                ...state,
                addClassContentLoading: false,
                addClassContentSuccessMsg: "Class added successfully!",
                classContents: state.classContents.concat(action.payload)
            }
        
        case actionTypes.FETCH_CLASS_CONTENTS_LOADING:
            return {
                ...state,
                fetchClassContentsLoading: action.payload
            }
        
        case actionTypes.FETCH_CLASS_CONTENTS_SUCCESS:
            return {
                ...state,
                fetchClassContentsLoading: false,
                classContents: action.payload
            }
        
        case actionTypes.DELETE_CLASS_CONTENT_LOADING:
            return {
                ...state,
                deleteClassContentLoading: action.payload
            }

        case actionTypes.DELETE_CLASS_CONTENT:
            return {
                ...state,
                deleteClassContentLoading: false,
                deleteClassContentSuccessMsg: "Class deleted successfully!",
                classContents: state.classContents.filter(content => content.key !== action.payload)
            }

        case actionTypes.ADD_COMMENT_IN_CLASS_CONTENT_LOADING:
            return {
                ...state,
                addClassCommentLoading: action.payload
            }
        
        case actionTypes.ADD_COMMENT_IN_CLASS_CONTENT:
            return {
                ...state,
                addClassCommentLoading: false,
                classComments: state.classComments.concat(action.payload)
            }
        
        case actionTypes.SHOW_COMMENT_POSTING_INDICATOR:
            return {
                ...state,
                showCommentPostingIndicator: action.payload
            }
            
        case actionTypes.FETCH_CLASS_COMMENTS_LOADING:
            return {
                ...state,
                fetchClassCommentsLoading: action.payload
            }

        case actionTypes.FETCH_CLASS_COMMENTS:
            return {
                ...state,
                classComments: action.payload
            }
        
        case actionTypes.DELETE_COMMENT_FROM_CONTENT_LOADING:
            return {
                ...state,
                deleteCommentFromContentLoading: action.payload
            }
        
        case actionTypes.DELETE_COMMENT_FROM_CONTENT:
            return {
                ...state,
                deleteCommentFromContentLoading: false,
                classComments: state.classComments.filter(comment => comment.key !== action.payload)
            }

        case actionTypes.FETCH_CLASS_STUDENTS_LOADING:
            return {
                ...state,
                fetchClassStudentsLoading: action.payload
            }

        case actionTypes.FETCH_CLASS_STUDENTS_ERROR:
            return {
                ...state,
                fetchClassStudentsErrorMsg: action.payload
            }

        case actionTypes.FETCH_CLASS_STUDENTS:
            return {
                ...state,
                classStudents: action.payload
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
        
        case actionTypes.FETCH_QUIZES_LOADING:
            return {
                ...state,
                fetchQuizesLoading: action.payload
            }
        case actionTypes.FETCH_QUIZES:
            return {
                ...state,
                classQuizes: action.payload,
            }
            
        case actionTypes.SUBMIT_QUIZ_LOADING:
            return {
                ...state,
                quizSubmissionLoading: action.payload,
                quizSubmissionSuccessMsg: '',
                quizSubmissionErrorMsg: ''
            }
        
        case actionTypes.SUBMIT_QUIZ:
            return {
                ...state,
                quizSubmissionSuccessMsg: "Your response has been recorded!",
                quizSubmissionErrorMsg: ''
            }
        case actionTypes.SUBMIT_QUIZ_ERROR:
            return {
                ...state,
                quizSubmissionErrorMsg: "Sorry! Your response cannot be recorded at that time! Try again!",
                quizSubmissionSuccessMsg: ''
            }

        case actionTypes.FETCH_QUIZ_RESPONSES_LOADING:
            return {
                ...state,
                fetchQuizResponsesLoading: action.payload
            }
        
        case actionTypes.FETCH_QUIZ_RESPONSES:
            return {
                ...state,
                quizResponses: action.payload
            }
        
        case actionTypes.FETCH_QUIZ_RESPONSES_ERROR:
            return {
                ...state,
                fetchQuizResponsesErrorMsg: 'An error occured duing fetching the responses of the quiz! Try again!'
            }
        
        case actionTypes.FETCH_USER_PROFILE_LOADING:
            return {
                ...state,
                fetchUserProfileLoading: action.payload
            }

        case actionTypes.FETCH_USER_PROFILE:
            return {
                ...state,
                userProfile: action.payload
            }
            
        default:
            return state;
    }
}