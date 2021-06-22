import React, {useState} from 'react';
import './ClassContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
import {addClassComment} from '../../../redux/actionCreators';
import { Spinner } from 'reactstrap';
import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        fetchClassContentsLoading: state.fetchClassContentsLoading,
        addClassCommentLoading: state.addClassCommentLoading,
        classComments: state.classComments
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addClassComment: (comment, clsId, contentId, userId) => dispatch(addClassComment(comment, clsId, contentId, userId))
    }
}

const ClassContent = props => {
    let { content } = props;
    let [ comment, setComment ] = useState('');
    let [ commentError, setCommentError ] = useState('');
    let [ showComment, setShowComment ] = useState(false);
    let [ showLoadingInContent, setShowLoadingInContent] = useState(null);

    // console.log(content);
    let posted_at = new Date(content.posted_at);

    let editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content.rawText)));
    // console.log(editorState);

    const handleCommentSubmit = () => {
        if(comment === "") {
            setCommentError("Comment cann't be empty!");
        } else {
            // console.log(comment);
            // showLoadingInContent = content.contentId;
            setShowLoadingInContent(content.contentId);

            props.addClassComment(comment, content.classId, content.contentId, props.userId);
            setComment('');
            setShowComment(true);
        }
    }

    let attachedFiles = content.attachedFileUrls.map((attachedFile, idx) => {
        return (
            <a key={`attached-file-${idx}`} href={attachedFile.downloadURL} target="_blank" rel="noreferrer" className="attached-content border text-success text-decoration-none">
                {props.fetchClassContentsLoading && <div className="text-center"><Spinner color="success" /></div>}
                <div className="attached-thumbnail">
                    {/* <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" /> */}
                    {attachedFile.type.includes('video') && <video>
                        <source src={attachedFile.downloadURL} type={attachedFile.type} />
                        Your browser does not support the video tag.
                    </video>}
                    {attachedFile.type.includes('image') && <img src={attachedFile.downloadURL} alt="file" />}
                    {!attachedFile.type.includes('video') && !attachedFile.type.includes('image') && <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/File_alt_font_awesome.svg/512px-File_alt_font_awesome.svg.png" alt="file" />}
                    
                </div>
                <div className="attach-details">
                    <h5>{attachedFile.fileName.substring(0, 9)}...</h5>
                    <p>{attachedFile.type}</p>
                </div>
            </a>
        )
    });

    let classComments = props.classComments.filter(comment => comment.contentId === content.contentId);

    // console.log(classComments);

    classComments = classComments.map(comment => {
        let posted_at = new Date(comment.posted_at);

        return (
            <div key={comment.key} className="comment">
                <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />
                <div className="commenter">
                    <h5>{comment.firstName} {comment.lastName} <span>{`${posted_at}`}</span></h5>
                    <h6 className="comment-text">{comment.comment}</h6>
                </div>
            </div>
        )
    });

    return (
        <div className="class-content border mt-4">
            <div className="publisher-info">
                <img width="50px" height="50px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                <div className="publisher-name ml-2">
                    <h5>{content.firstName} {content.lastName}</h5>
                    <span>{`${posted_at}`}</span>
                </div>
            </div>
            <div className="content-text">
                {/* <p>{content.rawText}</p> */}
                <div className="input-container">
                    <Editor
                        editorState={editorState}
                        // wrapperClassName="demo-wrapper"
                        // editorClassName="demo-editor"
                        // onEditorStateChange={this.onEditorStateChange}
                        placeholder="Announce something to your class"
                        readOnly
                    />
                </div>
            </div>
            <div className="attached-contents">
                {attachedFiles}
            </div>
            <div className="border"></div>
            <div className="total-comment" onClick={() => setShowComment(!showComment)}>
                <FontAwesomeIcon icon={faUser} />
                <span>{classComments.length} class comments</span>
            </div>
            <div className="all-comments" style={{display: showComment ? 'block': 'none'}}>
                {classComments}
            </div>
            <div className="border"></div>
            <div className="comment-form-box">
                <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                <div className="comment-input-container ml-2 border">
                    <input onChange={e => {setComment(e.target.value); setCommentError('')}} type="text" value={comment} name="comment" placeholder="Add class comment" />
                    <FontAwesomeIcon onClick={handleCommentSubmit} icon={faPaperPlane} style={{margin: "20px", color: "#9AA0A6"}} />
                    {props.addClassCommentLoading && showLoadingInContent === content.contentId && <Spinner color="success" />}
                </div>
            </div>
            <span className="text-danger" style={{marginLeft: "50px"}}>{commentError}</span>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassContent);