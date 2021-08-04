import React, {Component} from 'react';
import './AssignmentContent.css';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { firebase, storage } from '../../../../../firebase';
import { submitAssignment } from '../../../../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        userId: state.userId,
        assignmentSubmissionSuccessMsg: state.assignmentSubmissionSuccessMsg,
        assignmentSubmissionErrorMsg: state.assignmentSubmissionErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        submitAssignment: user_response => dispatch(submitAssignment(user_response))
    }
}

class AssignmentContent extends Component {
    state = {
        assignmentFile: null
    }

    handleAssignmentFile = e => {
        this.setState({
            assignmentFile: e.target.files[0]
        });
    }

    handleAssignmentSubmit = async (e, assignmentId) => {
        e.preventDefault();
        if(this.state.assignmentFile === null) {
            alert("Please select a pdf file.")
        } else {
            await new Promise((resolve, reject) => {
                let storageRef = storage.ref();
                let folderRef = storageRef.child(`assignment-response/${assignmentId}`);
    
                let file = this.state.assignmentFile;
                let {name, type} = file;
    
                let uploadTask = folderRef.child(name).put(file);
    
                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(progress);
    
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
                            const assignment_response_data = {
                                assignmentFileUrl: downloadURL,
                                marks: "",
                                name,
                                type,
                                user_id: this.props.userId,
                                assignment_id: assignmentId
                            }
                            this.props.submitAssignment(assignment_response_data);
                            resolve();
                        });
                    }
                );
            });
        }
    }

    render() {
        const {assignmentDetails} = this.props;
        const assignmentId = assignmentDetails.key;

        console.log(assignmentDetails);
        let dueDate = new Date(assignmentDetails.data.dueDate);
        let currentDate = new Date();
        
        let dateOverMsg = '';

        if(currentDate > dueDate) {
            // console.log('Due date is over!');
            dateOverMsg = 'Due date is over!';
        } else {
            console.log('You can submit this assignment!');
        }

        return (
            <div className="assignment-content-root">
                {/* <h3 className="text-center m-3">Submit assignment {assignmentDetails.data.title}</h3> */}
                {dateOverMsg !== "" && <h3 className="text-info text-center">Due date was {dueDate.toString()}!<br/> You can no longer submit this assignment.</h3>}

                <div className="assignment-file-div">
                    <h4>Assignment topic: <a target="_blank" rel="noreferrer" href={assignmentDetails.data.assignmentFileUrl}>{assignmentDetails.data.title}</a></h4>
                    <h4 style={{color: "#B4161B"}}>Due date: {dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}</h4>
                </div>
                <div className="assignment-upload-div mt-3">
                    {this.props.assignmentSubmissionSuccessMsg && <Alert color="success">{this.props.assignmentSubmissionSuccessMsg}</Alert>}
                    {this.props.assignmentSubmissionErrorMsg && <Alert color="danger">{this.props.assignmentSubmissionErrorMsg}</Alert>}
                    <form id="assignment-file-upload-form" className="assignment-uploader">
                        <input id="assignment-file-upload" type="file" name="fileUpload" accept="application/pdf" onChange={this.handleAssignmentFile} />

                        <label htmlFor="assignment-file-upload" id="assignment-file-drag">
                            <img id="assignment-file-image" src="#" alt="Preview" className="assignment-hidden" />
                            <div id="assignment-start">
                                {/* <i class="fa fa-download" aria-hidden="true"></i> */}
                                <FontAwesomeIcon icon={faDownload} size="3x" />
                                <div>Select a file or drag here</div>
                                <div id="assignment-notimage" className="assignment-hidden">Please select an image</div>
                                <span id="assignment-file-upload-btn" className="btn btn-primary">Select a file</span>
                                <span>{this.state.assignmentFile?.name}</span>
                            </div>
                            <div id="assignment-response" className="assignment-hidden">
                                <div id="assignment-messages"></div>
                                <progress className="assignment-progress" id="assignment-file-progress" value="0">
                                    <span>0</span>%
                                </progress>
                            </div>
                        </label>
                        <input type="submit" id="assignment-file-upload-btn" className="btn btn-primary" value="Submit" disabled={this.state.assignmentFile ? false : true} onClick={e => this.handleAssignmentSubmit(e, assignmentId)} />
                        <div style={{color: "#FF6263"}} className="ml-2">{this.state.assignmentFile === null && <p>Please select a file(file must be in pdf format.)</p>}</div>
                    </form>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentContent);