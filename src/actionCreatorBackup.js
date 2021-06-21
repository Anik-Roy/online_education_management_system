export const addClassContentSuccess = (pushId, content) => {
    return {
        type: actionTypes.ADD_CLASS_CONTENT,
        payload: {
            key: pushId,
            value: content
        }
    }
}

export const addClassContent = (content, uploadFileUrls, classId) => dispatch => {
    dispatch(addClassContentLoading(true));
    console.log(classId);
    
    const upload_content = {
        post: content,
        uploadFileUrls,
        posted_at: new Date()
    }

    // console.log(upload_content);

    axios.post(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classId}/contents.json`, upload_content)
        .then(response => {
            // console.log(response);
            const pushId = response.data.name;
            // console.log(pushId);
            axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/classes/${classId}/contents/${pushId}.json`)
                .then(response => {
                    console.log(response.data);
                    dispatch(addClassContentSuccess(pushId, response.data));
                })
                .catch(error => {
                    console.log(error);
                })
        })
        .catch(error => {
            console.log(error);
        })
}