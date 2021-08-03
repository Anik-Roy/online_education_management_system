import React, {useState} from 'react';
import './ClassContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
import {addClassComment, showCommentPosting, deleteClassContent, deleteCommentFromContent} from '../../../redux/actionCreators';
import {
    Spinner,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import { EditorState, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        fetchClassContentsLoading: state.fetchClassContentsLoading,
        addClassCommentLoading: state.addClassCommentLoading,
        deleteClassContentLoading: state.deleteClassContentLoading,
        deleteCommentFromContentLoading: state.deleteCommentFromContentLoading,
        showCommentPostingIndicator: state.showCommentPostingIndicator,
        classComments: state.classComments
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addClassComment: (comment, clsId, contentId, userId) => dispatch(addClassComment(comment, clsId, contentId, userId)),
        showCommentPosting: contentId => dispatch(showCommentPosting(contentId)),
        deleteClassContent: contentId => dispatch(deleteClassContent(contentId)),
        deleteCommentFromContent: commentId => dispatch(deleteCommentFromContent(commentId))
    }
}

const ClassContent = props => {
    // console.log(props);
    let { content } = props;
    let [ comment, setComment ] = useState('');
    let [ commentError, setCommentError ] = useState('');
    let [ showComment, setShowComment ] = useState(false);
    let [ showLoadingInContent, setShowLoadingInContent ] = useState(null);
    let [ showLoadingInComment, setShowLoadingInComment ] = useState(null);
    
    let contentId = props.content.contentId;

    // console.log(showLoadingInContent, contentId);

    let posted_at = new Date(content.posted_at);

    let editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content.rawText)));
    // console.log(editorState);

    const handleCommentSubmit = () => {
        if(comment === "") {
            setCommentError("Comment cann't be empty!");
        } else {
            // console.log(comment);
            // setShowLoadingInContent(content.contentId);
            console.log(content.contentId);
            props.showCommentPosting(content.contentId);

            props.addClassComment(comment, content.classId, content.contentId, props.userId);
            setComment('');
            setShowComment(true);
        }
    }

    let attachedFiles = content.attachedFileUrls && content.attachedFileUrls.map((attachedFile, idx) => {
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
        // console.log(comment.userId);
        return (
            <div key={comment.key} className="comment">
                <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />
                <div className="commenter">
                    {/* <h5>{comment.firstName} {comment.lastName} <span>{`${posted_at}`}</span></h5> */}
                    <h5>{comment.hasOwnProperty('fullName') && comment.fullName !== '' ? comment.fullName : comment.email} <span>{`${posted_at}`}</span></h5>
                    <h6 className="comment-text">{comment.comment}</h6>
                </div>
                {
                    props.userId === comment.userId &&
                    <div className="ml-auto" style={{fontSize: "24px"}}>
                        <UncontrolledDropdown>
                            <DropdownToggle nav>
                                {/* <FontAwesomeIcon icon={faEllipsisV} style={{color: 'black'}} /> */}
                                {
                                    props.deleteCommentFromContentLoading && showLoadingInComment === comment.key ?
                                        <Spinner color="success" /> : <FontAwesomeIcon icon={faEllipsisV} style={{color: 'black'}} />
                                }
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem onClick={() => {
                                    // setShowLoadingInContent(content.contentId);
                                    setShowLoadingInComment(comment.key);
                                    props.deleteCommentFromContent(comment.key)}}>
                                    Delete comment
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </div>
                }
            </div>
        )
    });

    return (
        <div className="class-content border mt-4">
            <div className="publisher-info">
                <div style={{display: 'flex'}}>
                    <img width="50px" height="50px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                    <div className="publisher-name ml-2">
                        <h5>{content.hasOwnProperty('fullName') && content.fullName !== '' ? content.fullName : content.email}</h5>
                        <span>{`${posted_at}`}</span>
                    </div>
                </div>
                {
                    props.userId === props.content.userId &&
                    <div className="ml-auto" style={{fontSize: "24px"}}>
                        <UncontrolledDropdown>
                            <DropdownToggle nav>
                                {/* <FontAwesomeIcon icon={faEllipsisV} style={{color: 'black'}} /> */}
                                {
                                    props.deleteClassContentLoading && showLoadingInContent === content.contentId ?
                                        <Spinner color="success" /> : <FontAwesomeIcon icon={faEllipsisV} style={{color: 'black'}} />
                                }
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem onClick={() => {
                                    setShowLoadingInContent(content.contentId);
                                    props.deleteClassContent(contentId)}}>
                                    Delete content
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </div>
                }
            </div>
            <div className="content-text">
                <div className="input-container content-container">
                    <Editor
                        editorState={editorState}
                        placeholder="Class content"
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
                    <input onChange={e => {setComment(e.target.value); setCommentError('');}} type="text" value={comment} name="comment" placeholder="Add class comment" />
                    {/* <p>{props.showCommentPostingIndicator}</p> */}
                    <FontAwesomeIcon onClick={handleCommentSubmit} icon={faPaperPlane} style={{margin: "20px", color: "#9AA0A6"}} />
                </div>
            </div>
            <div className="comment-posting">
                {
                    props.addClassCommentLoading && props.showCommentPostingIndicator === content.contentId && <p>Posting...</p>             
                }
            </div>
            <span className="text-danger" style={{marginLeft: "50px"}}>{commentError}</span>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassContent);