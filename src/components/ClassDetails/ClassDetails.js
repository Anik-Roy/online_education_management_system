import React, {Component} from 'react';
import './ClassDetails.css';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Nav,
    NavItem,
    Button,
    Progress,
    Spinner,
    Alert
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {connect} from 'react-redux';
import {fetchSingleClass, addClassContent, fetchClassContents, fetchClassComments} from '../../redux/actionCreators';
import { firebase, storage } from '../../firebase';
import ClassContent from './ClassContent/ClassContent';
import Classwork from './Classwork/Classwork';
import People from './People/People';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        classDetails: state.classDetails,
        fetchClassContentsLoading: state.fetchClassContentsLoading,
        addClassContentLoading: state.addClassContentLoading,
        addClassContentSuccessMsg: state.addClassContentSuccessMsg,
        addClassContentErrorMsg: state.addClassContentErrorMsg,
        deleteClassContentSuccessMsg: state.deleteClassContentSuccessMsg,
        classContents: state.classContents,
        classComments: state.classComments
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchSingleClass: clsId => dispatch(fetchSingleClass(clsId)),
        addClassContent: (text, uploadFileUrls, clsId, userId) => dispatch(addClassContent(text, uploadFileUrls, clsId, userId)),
        fetchClassContents: clsId => dispatch(fetchClassContents(clsId)),
        fetchClassComments: clsId => dispatch(fetchClassComments(clsId))
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
            isNavOpen: false,
            showStream: true,
            showClasswork: false,
            showPeople: false,
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

        let rawText = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));

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

    toggleNav = () => {
        this.setState({
            ...this.state,
            isNavOpen: !this.state.isNavOpen
        })
    }

    alterSelectedNavitem = e => {
        const navItem = e.target.innerText;
        // console.log(item);
        switch(navItem) {
            case 'Stream':
                this.setState({
                    ...this.state,
                    showStream: true,
                    showClasswork: false,
                    showPeople: false
                });
                break;
            case 'Classwork':
                this.setState({
                    ...this.state,
                    showStream: false,
                    showClasswork: true,
                    showPeople: false
                });
                break;
            case 'People':
                this.setState({
                    ...this.state,
                    showStream: false,
                    showClasswork: false,
                    showPeople: true
                });
                break;

            default:
                break;
        }
    }

    componentDidMount() {
        this.props.fetchClassContents(this.props.match.params.classId)
        this.props.fetchClassComments(this.props.match.params.classId)
    }
    
    render() {
        const { editorState } = this.state;
        const { classId } = this.props.match.params;
        const classDetails = this.props.location.state.classDetails;

        let makeDisabled = false;
        if(!this.state.editorState.getCurrentContent().hasText()) {
            makeDisabled = true;
        }

        makeDisabled = makeDisabled || this.props.addClassContentLoading;

        let isEditorDisabled = this.props.addClassContentLoading;

        let progressList = this.state.selectedFiles.map((fileObj, idx) => {
            return fileObj?.progress === 100 ? null : <Progress className="m-2" key={`progress-${idx}`} value={fileObj?.progress} />
        });

        let attachedFiles = this.state.attachedFiles.length > 0 && this.state.attachedFiles.map((fileUrlObj, idx) => {
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

        let classContents = this.props.classContents;
        classContents = classContents.sort((a, b) => {
            // console.log(a.value.posted_at, b.value.posted_at);
            return new Date(b.value.posted_at) - new Date(a.value.posted_at)
        });
        
        console.log(this.props.classContents);

        classContents = classContents.map(clsContent => (
            <ClassContent key={clsContent.key} content={{...clsContent.value, contentId: clsContent.key}} />
        ));

        let stream = (
            <div>
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
                        {this.props.fetchClassContentsLoading && <div className="text-center"><Spinner className="mx-auto my-2" color="success" /></div>}
                        {classContents}
                    </div>
                </div>
            </div>
        );

        let classwork = (<Classwork />);

        // console.log(classDetails);
        let people = (<People classId={this.props.match.params.classId} classTeacher={classDetails?.firstName + ' ' + classDetails?.lastName} classTeacherId={classDetails?.user} />);

        return (
            <div className="root">
                <Navbar color="faded" light expand="md">
                    <NavbarToggler onClick={this.toggleNav} />
                    <Collapse isOpen={this.state.isNavOpen} navbar>
                        <Nav className="mx-auto" navbar>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showStream ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Stream
                            </NavItem>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showClasswork ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                Classwork
                            </NavItem>
                            <NavItem onClick={this.alterSelectedNavitem} className={this.state.showPeople ? "text-success mx-4": "text-muted mx-4"} style={{cursor: "pointer"}}>
                                People
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                {this.state.showStream && stream}
                {this.state.showClasswork && classwork}
                {this.state.showPeople && people}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassDetails);