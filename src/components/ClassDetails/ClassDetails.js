import React, {Component} from 'react';
import './ClassDetails.css';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Button, Progress, Spinner, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
import {fetchSingleClass, addClassContent, fetchClassContents} from '../../redux/actionCreators';
import { firebase, storage } from '../../firebase';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        classDetails: state.classDetails,
        addClassContentLoading: state.addClassContentLoading,
        addClassContentSuccessMsg: state.addClassContentSuccessMsg,
        addClassContentErrorMsg: state.addClassContentErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchSingleClass: clsId => dispatch(fetchSingleClass(clsId)),
        addClassContent: (text, uploadFileUrls, clsId, userId) => dispatch(addClassContent(text, uploadFileUrls, clsId, userId)),
        fetchClassContents: clsId => dispatch(fetchClassContents(clsId))
    }
}

class ClassDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            selectedFiles: [],
            attachedFiles: [],
            submitBtnClicked: false,
            visible: true,
        };
    }
    
    onEditorStateChange = editorState => {
        this.setState({
            editorState,
        });
    };

    handleSubmit = async (e, clsId) => {
        e.preventDefault();
        
        // let rawData = convertToRaw(this.state.editorState.getCurrentContent());
        // console.log(rawData);

        let rawText = convertToRaw(this.state.editorState.getCurrentContent());

        await Promise.all(
            this.state.selectedFiles.map(async (fileObj, idx) => {
                return await this.uploadFile(fileObj, idx, clsId);
            })    
        ).then(() => {
            console.log('Attached file upload > ', this.state.attachedFiles);
            this.uploadContentToDatabase(rawText, clsId);
        }, (errorCode) => {
            console.log('File upload > an error occured!', errorCode);
        });
        
        console.log('all file uploaded!');
    }

    uploadContentToDatabase = (rawText, clsId) => {
        this.props.addClassContent(rawText, this.state.attachedFiles, clsId, this.props.userId);
        this.resetStateAfterContentAdded();
    }

    uploadFile = (fileObj, idx, clsId) => {
        return new Promise((resolve, reject) => {
            let storageRef = storage.ref();
            let folderRef = storageRef.child(clsId);

            let file = fileObj.file;
            let {name, type} = file;

            let uploadTask = folderRef.child(name).put(file);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on('state_changed',
                (snapshot) => {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // console.log('Upload is ' + progress + '% done');
                    
                    let tempSelectedFiles = this.state.selectedFiles;
                    let tempFileObj = this.state.selectedFiles[idx];
                    tempFileObj.progress = progress;
                    tempSelectedFiles[idx] = tempFileObj;

                    this.setState({
                        ...this.state,
                        selectedFiles: tempSelectedFiles
                    });

                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            // console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            // console.log('Upload is running');
                            break;
                        default:
                            // console.log('default case');
                            break;
                    }
                },
                (error) => {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    console.log(error.code);
                    reject(error.code);
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        // console.log('File available at', downloadURL);
                        this.setState({
                            attachedFiles: this.state.attachedFiles.concat(
                                {
                                    downloadURL,
                                    fileName: name,
                                    type,
                                    fileRef: uploadTask.snapshot.ref
                                }
                            )
                        });
                        resolve();
                    });
                }
            );
        });
    }

    deleteFile = (fileUrlObj, fileRef) => {
        fileRef.delete().then(() => {
            this.setState({
                attachedFiles: this.state.attachedFiles.filter(fileObj => fileObj !== fileUrlObj)
            })
        }).catch(error => {
            console.log(error);
        });
    }

    handleFiles = e => {
        // console.log(e.target.files);
        document.querySelector('.file-name').replaceChildren();

        let files = [];

        for(let i = 0; i < e.target.files.length; i++) {
            let file = e.target.files[i];
            files.push({file, progress: 0});

            const { name: fileName, size } = file;

            // Convert size in bytes to kilo bytes
            const fileSize = (size / 1000).toFixed(2);
            // Set the text content
            const fileNameAndSize = `${fileName} - ${fileSize}KB`;

            var node = document.createElement("LI");
            node.classList.add("text-success");
            var textnode = document.createTextNode(fileNameAndSize);
            node.appendChild(textnode);
            document.querySelector('.file-name').appendChild(node);
        }
        this.setState({
            ...this.state,
            selectedFiles: files
        });
    }

    resetStateAfterContentAdded = () =>{
        this.setState({
            ...this.state,
            selectedFiles: [],
            attachedFiles: [],
            submitBtnClicked: false
        });
        document.querySelector('.file-name').replaceChildren();
    }

    onDismiss = () => {
        this.setState({
            ...this.state,
            visible: false
        })
    }

    componentDidMount() {
        this.props.fetchClassContents(this.props.match.params.classId)
    }
    
    render() {
        const { editorState } = this.state;
        const { classId } = this.props.match.params;
        // const classDetails = this.props.classDetails;
        const classDetails = this.props.location.state.classDetails;

        // console.log('class details > ', classDetails);

        // console.log(this.state.selectedFiles);

        let makeDisabled = false;
        if(!this.state.editorState.getCurrentContent().hasText()) {
            makeDisabled = true;
        }

        makeDisabled = makeDisabled || this.props.addClassContentLoading;

        let isEditorDisabled = this.props.addClassContentLoading;

        let progressList = this.state.selectedFiles.map((fileObj, idx) => {
            return fileObj?.progress === 100 ? null : <Progress className="m-2" key={`progress-${idx}`} value={fileObj?.progress} />
        });

        let attachedFiles = this.state.attachedFiles.map((fileUrlObj, idx) => {
            return (
                <div key={`uploaded-file-${idx}`} className="upload-file-container">
                    <a href={fileUrlObj.downloadURL} target="_blank" rel="noreferrer" className="uploaded-file">
                        {fileUrlObj.type.includes('video') && <video width="220" height="100%">
                            <source src={fileUrlObj.downloadURL} type={fileUrlObj.type} />
                            Your browser does not support the video tag.
                        </video>}
                        {fileUrlObj.type.includes('image') && <img width="220" height="100%" src={fileUrlObj.downloadURL} alt="file" />}
                        {!fileUrlObj.type.includes('video') && !fileUrlObj.type.includes('image') && <img width="220" height="100%" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/File_alt_font_awesome.svg/512px-File_alt_font_awesome.svg.png" alt="file" />}
                        <div className="file-info">
                            <h5>{fileUrlObj.fileName}</h5>
                            <span>{fileUrlObj.type}</span>
                        </div>
                    </a>
                    <FontAwesomeIcon onClick={() => this.deleteFile(fileUrlObj, fileUrlObj.fileRef)} className="file-delete-icon" icon={faTrashAlt} />
                </div>
            )
        });

        return (
            <div className="root">
                <div className="banner-top">
                    <h3>{classDetails?.className}: {classDetails?.subject}</h3>
                    <h5>{classDetails?.firstName} {classDetails?.lastName}</h5>
                    <span>{classDetails?.email}</span>
                </div>
                <div className="main-content">
                    <div className="class-notice border rounded p-2">
                        <h2>Upcoming</h2>
                        <span>Woohoo, no work due soon!</span>
                    </div>
                    <div className="class-contents px-2">
                        <div className="class-input-box border">
                            <div className="input-container">
                                <Editor
                                    editorState={editorState}
                                    wrapperClassName="demo-wrapper"
                                    editorClassName="demo-editor"
                                    onEditorStateChange={this.onEditorStateChange}
                                    placeholder="Announce something to your class"
                                    readOnly={isEditorDisabled}
                                />
                            </div>
                            <div className="mt-2">
                                {attachedFiles}
                            </div>
                            <div className="mt-2">
                                {this.props.addClassContentSuccessMsg !== "" && <Alert color="success" isOpen={this.state.visible} toggle={this.onDismiss}>{this.props.addClassContentSuccessMsg}</Alert>}
                            </div>
                            <div className="btn-container mt-2">
                                <div className="file-input">
                                    <input type="file" multiple id="file" className="file" onChange={this.handleFiles} />
                                    <label htmlFor="file" className="btn btn-outline-primary"><FontAwesomeIcon className="mr-3" icon={faPaperclip} />Add</label>
                                </div>
                                {this.props.addClassContentLoading && <Spinner color="success" />}
                                <Button onClick={(e) => this.handleSubmit(e, classId)} outline color="success" disabled={makeDisabled || this.state.submitBtnClicked}>Submit</Button>
                            </div>
                            <ul className="file-name"></ul>
                                {this.state.selectedFiles.length > 0 && <div>
                                    {/* <span className="text-info">Progress </span><Progress value={this.state.progress} /><span className="text-info">%</span> */}
                                    {progressList}
                            </div>}
                        </div>
                        <div className="class-content border mt-4">
                            <div className="publisher-info">
                                <img width="50px" height="50px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                                <div className="publisher-name ml-2">
                                    <h5>Shahidur Rahman</h5>
                                    <span>Jun 16</span>
                                </div>
                            </div>
                            <div className="content-text mt-3">
                                <p>Lecture on Security Technologies</p>
                            </div>
                            <div className="attached-contents">
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border"></div>
                            <div className="comment-form-box">
                                <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                                <div className="comment-input-container ml-2 border">
                                    <input type="text" name="comment" placeholder="Add class comment" />
                                    <FontAwesomeIcon icon={faPaperPlane} style={{margin: "20px", color: "#9AA0A6"}} />
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassDetails);