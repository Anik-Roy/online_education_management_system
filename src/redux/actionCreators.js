import * as actionTypes from './actionTypes';
import axios from 'axios';

// authentication actions
export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        payload: {
            token: token,
            userId: userId,
        }
    }
}

export const authLoading = isLoading => {
    return {
        type: actionTypes.AUTH_LOADING,
        payload: isLoading,
    }
}

export const authFailed = errMsg => {
    return {
        type: actionTypes.AUTH_FAILED,
        payload: errMsg,
    }
}

export const auth = (userData, mode) => dispatch => {
    dispatch(authLoading(true));
    
    const authData = {
        email: userData.email,
        password: userData.password,
        returnSecureToken: true,
    }

    console.log(authData);

    let authUrl = null;

    if(mode === "signup") {
        authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
    } else {
        authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
    }

    const API_KEY = 'AIzaSyA1Zis2HMVkvDlk7n5Zbx8P-0xYCojbKUA';

    axios.post(authUrl+API_KEY, authData)
    .then(async response => {
        // console.log(response);
        dispatch(authLoading(false));
        localStorage.setItem('token', response.data.idToken);
        localStorage.setItem('userId', response.data.localId);
        const expirationTime = new Date(new Date().getTime() + response.data.expiresIn * 1000);
        localStorage.setItem('expirationTime', expirationTime);

        let userId = response.data.localId;

        if(mode === "signup") {
            await axios.put(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}.json`, {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            }).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
        }

        dispatch(authSuccess(response.data.idToken, response.data.localId));
    })
    .catch(error => {
        dispatch(authLoading(false));
        console.log(error.message);
        let msg = '';
        if(error.message.includes('400')) {
            msg = 'No account found with the given credentials!';
        } else {
            msg = error;
        }

        dispatch(authFailed(msg));
    });
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expirationTime');
    return {
        type: actionTypes.AUTH_LOGOUT,
    }
}


export const authCheckLoading = isLoading => {
    return {
        type: actionTypes.AUTH_CHECK_LOADING,
        payload: isLoading
    }
}

export const authCheck = () => dispatch => {
    dispatch(authLoading(true));

    const token = localStorage.getItem('token');
    
    if(!token) {
        // logout
        dispatch(authLoading(false));
        dispatch(logout());
    } else {
        const expirationTime = new Date(localStorage.getItem('expirationTime'));
        if(expirationTime <= new Date()) {
            // logout
            dispatch(authLoading(false));
            dispatch(logout());
        } else {
            const userId = localStorage.getItem('userId');
            dispatch(authLoading(false));
            dispatch(authSuccess(token, userId));
        }
    }
}


// Modal toogle actions
export const toogleClassModal = () => {
    console.log('clicked!');
    
    return {
        type: actionTypes.TOOGLE_CREATE_CLASS_MODAL
    }
}

export const toogleJoinClassModal = () => {
    console.log('clicked join class!');
    
    return {
        type: actionTypes.TOOGLE_JOIN_CLASS_MODAL
    }
}

export const toogleUnenrollClassModal = () => {
    return {
        type: actionTypes.TOOGLE_UNENROLL_CLASS_MODAL
    }
}

// Create class actions
export const createClassLoading = isLoading => {
    return {
        type: actionTypes.CREATE_CLASS_LOADING,
        payload: isLoading
    }
}

export const createClassSuccess = data => {
    return {
        type: actionTypes.CREATE_CLASS_SUCCESS,
        payload: data
    }
}

export const createClass = (clsData, userId) => dispatch => {
    dispatch(createClassLoading(true));

    let classDetails = {
        className: clsData.className,
        section: clsData.section,
        subject: clsData.subject,
        room: clsData.room,
        user: userId
    }
    axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/classes.json`, classDetails)
        .then(response => {
            console.log(response);
            if(response.status === 200) {
                // console.log(response.data.name);
                dispatch(createClassLoading(false));
                dispatch(createClassSuccess(response.data));
                let classCode = response.data.name;
                classDetails = {
                    classCode: classCode,
                    user_id: userId,
                    joined_at: new Date()
                }

                axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classCode}.json`)
                    .then(response => {
                        // console.log(response);
                        if(response.data !== null) {
                            let class_info = response.data;
                            console.log(class_info);
                            axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class.json`, classDetails)
                                .then(async response => {
                                    console.log(response);
                                    if(response.status === 200) {
                                        let class_teacher_info = {};
                                        await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${class_info.user}.json`)
                                            .then(teacher_info => {
                                                // console.log(teacher_info.data);
                                                class_teacher_info = teacher_info.data;
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                class_teacher_info = {};
                                            });
                                        class_info = {
                                            key: response.data.name,
                                            value: {...class_info, ...class_teacher_info}
                                        }
                                        dispatch(joinClassLoading(false));
                                        dispatch(joinClassSuccess(class_info));
                                    } else {
                                        dispatch(joinClassLoading(false));
                                        dispatch(joinClassFailed("An error occured!"));
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    dispatch(joinClassLoading(false));
                                    dispatch(joinClassFailed(error));
                                });
                        } else {
                            console.log("No class found with this id!");
                            dispatch(joinClassLoading(false));
                            dispatch(joinClassFailed("An error occured!"));
                        }
                    })
                    .catch(error => {
                        dispatch(joinClassLoading(false));
                        dispatch(joinClassFailed(error));
                    });
            }
        })
        .catch(error => {
            console.log(error);
            dispatch(createClassLoading(false));
        });
}


// Join class actions
export const joinClassLoading = isLoading => {
    return {
        type: actionTypes.JOIN_CLASS_LOADING,
        payload: isLoading
    }
}

export const joinClassSuccess = data => {
    return {
        type: actionTypes.JOIN_CLASS_SUCCESS,
        payload: data
    }
}

export const joinClassFailed = errMsg => {
    return {
        type: actionTypes.JOIN_CLASS_FAILED,
        payload: errMsg
    }
}

const alreadyJoined = async (classCode, userId) => {
    let response = await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class.json?orderBy="user_id"&equalTo="${userId}"`);
    for(let key in response.data) {
        if(response.data[key].classCode === classCode) {
            return true;
        }
    }
    return false;
}

export const joinClass = (classCode, userId) => dispatch => {
    dispatch(joinClassLoading(true));

    let classDetails = {
        classCode: classCode,
        user_id: userId,
        joined_at: new Date()
    }

    console.log(classCode, userId);
    alreadyJoined(classCode, userId)
        .then(response => {
            console.log(response);
            if(response) {
                // console.log(response.data);
                dispatch(joinClassLoading(false));
                dispatch(toogleJoinClassModal());
                dispatch({
                    type: actionTypes.JOINED_ALREADY,
                    payload: "You've already enrolled in this class"
                })
            } else {
                // console.log("Not enrolled yet!");
                axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classCode}.json`)
                    .then(response => {
                        // console.log(response);
                        if(response.data !== null) {
                            let class_info = response.data;
                            console.log(class_info);
                            axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class.json`, classDetails)
                                .then(async response => {
                                    console.log(response);
                                    if(response.status === 200) {
                                        let class_teacher_info = {};
                                        await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${class_info.user}.json`)
                                            .then(teacher_info => {
                                                // console.log(teacher_info.data);
                                                class_teacher_info = teacher_info.data;
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                class_teacher_info = {};
                                            });
                                        class_info = {
                                            key: response.data.name,
                                            value: {...class_info, ...class_teacher_info},
                                            classCode: classCode
                                        }
                                        dispatch(joinClassLoading(false));
                                        dispatch(joinClassSuccess(class_info));
                                        dispatch(toogleJoinClassModal());
                                    } else {
                                        dispatch(joinClassLoading(false));
                                        dispatch(joinClassFailed("An error occured! Try again!"));
                                        dispatch(toogleJoinClassModal());
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    dispatch(joinClassLoading(false));
                                    dispatch(joinClassFailed(error));
                                    dispatch(toogleJoinClassModal());
                                });
                        } else {
                            console.log("No class found with this id!");
                            dispatch(joinClassLoading(false));
                            dispatch(joinClassFailed("No class found with this id!"));
                            dispatch(toogleJoinClassModal());
                        }
                    })
                    .catch(error => {
                        dispatch(joinClassLoading(false));
                        dispatch(joinClassFailed(error));
                        dispatch(toogleJoinClassModal());
                    });
            }
        })
        .catch(error => {
            console.log(error);
        });
}

// Fetch class actions
export const fetchClassLoading = isLoading => {
    return {
        type: actionTypes.FETCH_CLASS_LOADING,
        payload: isLoading
    }
}

const fetchClassesFromClassCode = async data => {
    let classes = [];
    if(data !== null) {
        let data_list = Object.entries(data);
        let promises = [];

        data_list.forEach(async ([key, value]) => {
            // classes.push({key: key, value: value});
            // console.log(value.joined_at);
            promises.push(
                axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${value.classCode}.json`)
                    .then(async response => {
                        const class_teacher = response.data.user;
                        let class_teacher_info = null;

                        await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${class_teacher}.json`)
                            .then(teacher_info => {
                                // console.log(teacher_info.data);
                                class_teacher_info = teacher_info.data;
                            })
                            .catch(error => {
                                console.log(error);
                                class_teacher_info = {};
                            });
                        // console.log(class_teacher);
                        classes.push({key: key, value: {...response.data, ...class_teacher_info}, joined_at: value.joined_at, classCode: value.classCode});
                    })
            );
        });
        await Promise.all(promises);

        return classes;
    }
    // return classes;
}

export const fetchClassSuccess = classes => {
    return {
        type: actionTypes.FETCH_CLASS_SUCCESS,
        payload: classes
    }
}

export const fetchClassError = errMsg => {
    return {
        type: actionTypes.FETCH_CLASS_ERROR,
        payload: errMsg
    }
}

export const fetchClass = userId => dispatch => {
    dispatch(fetchClassLoading(true));
    
    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class.json?orderBy="user_id"&equalTo="${userId}"`)
        .then(response => {
            // console.log(response.data);
            fetchClassesFromClassCode(response.data)
                .then(response => {
                    // console.log(response);
                    dispatch(fetchClassSuccess(response));
                    dispatch(fetchClassLoading(false));
                })
                .catch(error => {
                    console.log(error);
                    dispatch(fetchClassError(error));
                    dispatch(fetchClassLoading(false));
                });
        })
        .catch(error => {
            console.log(error);
            dispatch(fetchClassLoading(false));
            dispatch(fetchClassError(error));
        });

    // axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}/joined_classes.json`)
    //     .then(response => {
    //         // console.log(response);
    //         dispatch(fetchClassLoading(false));
    //         let cl = fetchClassesFromClassCode(response.data);
    //         console.log(cl);

    //             // .then(response => {
    //             //     console.log(response);
    //             //     // dispatch(response);
    //             //     dispatch(fetchClassSuccess(response));
    //             // })
    //             // .catch(error => {
    //             //     console.log(error);
    //             // })
    //         // dispatch(fetchClassSuccess(response.data));
    //     })
    //     .catch(error => {
    //         console.log(error);
    //         dispatch(fetchClassLoading(false));
    //         dispatch(fetchClassError(error));
    //     });
}

export const fetchSingleClassLoading = isLoading => {
    return {
        type: actionTypes.FETCH_SINGLE_CLASS_LOADING,
        payload: isLoading
    }
}

export const fetchSignleClassError = errMsg => {
    return {
        type: actionTypes.FETCH_SINGLE_CLASS_ERROR,
        payload: errMsg
    }
}

export const fetchSingleClass = classId => dispatch => {
    dispatch(fetchSingleClassLoading(true));

    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classId}.json`)
        .then(response => {
            if(response.data) {
                dispatch(fetchSingleClassLoading(false));
                dispatch({
                    type: actionTypes.FETCH_SINGLE_CLASS,
                    payload: response.data
                });
            } else {
                dispatch(fetchSingleClassLoading(false));
                dispatch(fetchSignleClassError("No class found with this id!"));
            }
        })
        .catch(error => {
            console.log(error);
            dispatch(fetchSingleClassLoading(false));
            dispatch(fetchSignleClassError(error));
        })
}

// Unenroll class actions
export const selectedClasstoUnenroll = cls => {
    console.log(cls);
    return {
        type: actionTypes.SELECTED_CLASS_TO_UNENROLL,
        payload: cls
    }
}

export const unenrollClassLoading = isLoading => {
    return {
        type: actionTypes.UNENROLL_CLASS_LOADING,
        payload: isLoading
    }
}

export const unenrollClassSuccess = data => {
    return {
        type: actionTypes.UNENROLL_CLASS_SUCCESS,
        payload: data
    }
}

export const unenrollClassError = err => {
    return {
        type: actionTypes.UNENROLL_CLASS_FAILED,
        payload: err
    }
}

export const unenrollClass = id => dispatch => {
    dispatch(unenrollClassLoading(true));
    console.log(id);
    axios.delete(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class/${id}.json`)
        .then(response => {
            console.log(response);
            dispatch(unenrollClassLoading(false));
            dispatch(unenrollClassSuccess({id: id, msg: "Successfully unenrolled from this class!"}));
            dispatch(toogleUnenrollClassModal());
        })
        .catch(error => {
            console.log(error);
            dispatch(unenrollClassLoading(false));
            dispatch(unenrollClassError("An error occured!"));
            dispatch(toogleUnenrollClassModal());
        });

}

export const addClassContentLoading = isLoading => {
    return {
        type: actionTypes.ADD_CLASS_CONTENT_LOADING,
        payload: isLoading
    }
}

export const addClassContentSuccess = (pushId, content) => {
    return {
        type: actionTypes.ADD_CLASS_CONTENT,
        payload: {
            key: pushId,
            value: content
        }
    }
}

export const addClassContent = (rawText, attachedFileUrls, classId, userId) => dispatch => {
    dispatch(addClassContentLoading(true));
    // console.log(classId);
    
    const upload_content = {
        rawText: rawText,
        attachedFileUrls,
        classId,
        userId,
        posted_at: new Date()
    }

    // console.log(upload_content);

    axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/class_contents.json`, upload_content)
        .then(response => {
            // console.log(response);
            const pushId = response.data.name;
            // console.log(pushId);
            axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/class_contents/${pushId}.json`)
                .then(response => {
                    console.log(response.data.userId);
                    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}.json`)
                            .then(creator => {
                                // console.log(creator.data);
                                let contentCreator = creator.data;
                                dispatch(addClassContentSuccess(pushId, {...response.data, ...contentCreator}));
                                // return {key, value: {...response.data[key], ...creator.data}}
                            })
                            .catch(error => {
                                console.log(error);
                                dispatch(addClassContentSuccess(pushId, response.data));
                            })
                    // dispatch(addClassContentSuccess(pushId, response.data));
                })
                .catch(error => {
                    console.log(error);
                })
        })
        .catch(error => {
            console.log(error);
        });

    // axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classId}/contents.json`, upload_content)
    //     .then(response => {
    //         // console.log(response);
    //         const pushId = response.data.name;
    //         // console.log(pushId);
    //         axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classId}/contents/${pushId}.json`)
    //             .then(response => {
    //                 console.log(response.data);
    //                 dispatch(addClassContentSuccess(pushId, response.data));
    //             })
    //             .catch(error => {
    //                 console.log(error);
    //             })
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     })
}

export const fetchClassContentsLoading = isLoading => {
    return {
        type: actionTypes.FETCH_CLASS_CONTENTS_LOADING,
        payload: isLoading
    }
}

export const fetchClassContentsSuccess = contents => {
    return {
        type: actionTypes.FETCH_CLASS_CONTENTS_SUCCESS,
        payload: contents
    }
}

export const fetchClassContents = classId => dispatch => {
    // console.log(classId);
    dispatch(fetchClassContentsLoading(true));
    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/class_contents.json?orderBy="classId"&equalTo="${classId}"`)
        .then(async response => {
            // let data_list = [];
            if(response.data !== null) {
                // console.log(response.data);
                await Promise.all(
                    Object.keys(response.data).map(async key => {
                        // console.log(response.data[key].userId);
                        let contentCreatorId = response.data[key].userId;
                        let contentCreator = {};
    
                        await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${contentCreatorId}.json`)
                            .then(creator => {
                                // console.log(creator.data);
                                contentCreator = creator.data;
                                // return {key, value: {...response.data[key], ...creator.data}}
                            })
                            .catch(error => {
                                console.log(error);
                            })
                        return {key, value: {...response.data[key], ...contentCreator}}
                    })
                ).then(data_list => {
                    // console.log(ls);
                    dispatch(fetchClassContentsSuccess(data_list));
                });

                // console.log(data_list);
                // data_list = Object.keys(response.data).map(async key => {
                //     console.log(response.data[key].userId);
                //     let contentCreatorId = response.data[key].userId;
                //     let contentCreator = {};

                //     await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${contentCreatorId}.json`)
                //         .then(creator => {
                //             console.log(creator.data);
                //             contentCreator = creator.data;
                //             return {key, value: {...response.data[key], ...creator.data}}
                //         })
                //         .catch(error => {
                //             console.log(error);
                //         })
                //     return {key, value: {...response.data[key], ...contentCreator}}
                // });   
                // console.log(data_list);
                // dispatch(fetchClassContentsSuccess(data_list));
            }
        })
        .catch(error => {
            console.log(error);
        })
}

export const deleteClassContentLoading = isLoading => {
    return {
        type: actionTypes.DELETE_CLASS_CONTENT_LOADING,
        payload: isLoading
    }
}

export const deleteClassContentSuccess = contentId => {
    return {
        type: actionTypes.DELETE_CLASS_CONTENT,
        payload: contentId
    }
}

export const deleteClassContent = contentId => dispatch => {
    dispatch(deleteClassContentLoading(true));
    axios.delete(`https://sust-online-learning-default-rtdb.firebaseio.com/class_contents/${contentId}.json`)
        .then(response => {
            console.log(response.data);
            dispatch(deleteClassContentSuccess(contentId));
        })
        .catch(error => {
            console.log(error);
        });
}

export const addClassCommentLoading = isLoading => {
    return {
        type: actionTypes.ADD_COMMENT_IN_CLASS_CONTENT_LOADING,
        payload: isLoading
    }
}

export const addClassCommentSuccess = data => {
    return {
        type: actionTypes.ADD_COMMENT_IN_CLASS_CONTENT,
        payload: data
    }
}

export const addClassComment = (comment, clsId, contentId, userId) => dispatch => {
    dispatch(addClassCommentLoading(true));
    let comment_obj = {
        comment,
        clsId,
        contentId,
        userId,
        posted_at: new Date()
    }

    axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/comments.json`, comment_obj)
        .then(response => {
            // console.log(response.data);
            axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/comments/${response.data.name}.json`)
                .then(commentResponse => {
                    // console.log(commentResponse.data);
                    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}.json`)
                        .then(commenter => {
                            // console.log(creator.data);
                            let commenterData = commenter.data;
                            console.log(commenterData);
                            dispatch(addClassCommentSuccess({key: response.data.name, ...commentResponse.data, ...commenterData}));
                        })
                        .catch(error => {
                            console.log(error);
                        })
                    // dispatch(addClassCommentSuccess({key: response.data.name, ...commentResponse.data}));
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });
}

export const fetchClassCommentsLoading = isLoading => {
    return {
        type: actionTypes.FETCH_CLASS_COMMENTS_LOADING,
        payload: isLoading
    }
}

export const fetchClassCommentsSuccess = async classComments => {
    let clsComments = [];
    for(let key in classComments) {
        let userId = classComments[key].userId;

        await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}.json`)
            .then(commenter => {
                // console.log(creator.data);
                let commenterData = commenter.data;
                clsComments.push({key, ...classComments[key], ...commenterData});
            })
            .catch(error => {
                console.log(error);
            });
    }
    return clsComments;
}

export const fetchClassComments = clsId => dispatch => {
    dispatch(fetchClassCommentsLoading(true));

    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/comments.json?orderBy="clsId"&equalTo="${clsId}"`)
        .then(response => {
            // console.log(response.data);
            fetchClassCommentsSuccess(response.data).then(clsComments => {
                // console.log(clsComments);
                dispatch({
                    type: actionTypes.FETCH_CLASS_COMMENTS,
                    payload: clsComments
                });
            });
        })
        .catch(error => {
            console.log(error);;
        });
}

export const deleteCommentFromContentLoading = isLoading => {
    return {
        type: actionTypes.DELETE_COMMENT_FROM_CONTENT_LOADING,
        payload: isLoading
    }
}

export const deleteCommentFromContentSuccess = commentId => {
    return {
        type: actionTypes.DELETE_COMMENT_FROM_CONTENT,
        payload: commentId
    }
}

export const deleteCommentFromContent = commentId => dispatch => {
    dispatch(deleteCommentFromContentLoading(true));
    axios.delete(`https://sust-online-learning-default-rtdb.firebaseio.com/comments/${commentId}.json`)
        .then(response => {
            console.log(response.data);
            dispatch(deleteCommentFromContentSuccess(commentId));
        })
        .catch(error => {
            console.log(error);
        });
}

export const fetchClassStudentsLoading = isLoading => {
    return {
        type: actionTypes.FETCH_CLASS_STUDENTS_LOADING,
        payload: isLoading
    }
}

export const fetchClassStudentsError = error => {
    return {
        type: actionTypes.FETCH_CLASS_STUDENTS_ERROR,
        payload: error
    }
}

export const fetchClassStudentsSuccess = data => {
    return {
        type: actionTypes.FETCH_CLASS_STUDENTS,
        payload: data
    }
}

export const fetchClassStudents = classCode => dispatch => {
    dispatch(fetchClassStudentsLoading(true));
    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/enrolled_class.json?orderBy="classCode"&equalTo="${classCode}"`)
        .then(async response => {
            let data_list = [];

            await Promise.all(
                Object.keys(response.data).map(async key => {
                    let userId = response.data[key].user_id;
                    // console.log(userId);
                    await axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/users/${userId}.json`)
                        .then(response => {
                            data_list.push({
                                key: userId,
                                value: response.data
                            })
                        }).catch(error => {
                            console.log(error);
                        });
                })
            ).then(() => {
                // console.log(data_list);
                dispatch(fetchClassStudentsSuccess(data_list));
            }).catch(error => {
                console.log(error);
            });
            // console.log(data_list);
            // dispatch(fetchClassStudentsSuccess(data_list));
        })
        .catch(error => {
            console.log(error);
            dispatch(fetchClassStudentsError(error));
        });
}

export const showCommentPosting = contentId => {
    console.log(contentId);
    return {
        type: actionTypes.SHOW_COMMENT_POSTING_INDICATOR,
        payload: contentId
    }
}

export const createQuizLoading = isLoading => {
    return {
        type: actionTypes.CREATE_QUIZ_LOADING,
        payload: isLoading
    }
}

export const createQuiz = quiz_data => dispatch => {
    console.log(quiz_data);
    dispatch(createQuizLoading(true));

    axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/quizes.json`, quiz_data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });
}

export const fetchQuizesLoading = isLoading => {
    return {
        type: actionTypes.FETCH_QUIZES_LOADING,
        payload: isLoading
    }
}

export const fetchQuizesSuccess = data => {
    return {
        type: actionTypes.FETCH_QUIZES,
        payload: data
    }
}

export const fetchQuizes = clsId => dispatch => {
    dispatch(fetchQuizesLoading(true));

    axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/quizes.json?orderBy="class_id"&equalTo="${clsId}"`)
        .then(response => {
            // console.log(response.data);
            let classQuizes = [];
            Object.keys(response.data).map(key => {
                classQuizes.push({key: key, data: response.data[key]});
                // return console.log(key, response.data[key]);
                return true;
            });
            // console.log(classQuizes);
            dispatch(fetchQuizesSuccess(classQuizes));
        })
        .catch(error => {
            console.log(error);
        });
}