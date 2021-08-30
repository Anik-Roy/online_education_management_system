import React, {useState, useEffect} from 'react';
import './AssignmentResponses.css';
import {connect} from 'react-redux';
import {fetchAssignmentResponses, updateAssignmentMarks} from '../../../../../redux/actionCreators';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import {faHandPointUp, faSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { CSVLink } from "react-csv";

const mapStateToProps = state => {
    return {
        userId: state.userId,
        assignmentResponses: state.assignmentResponses,
        updateAssignmentMarkLoading: state.updateAssignmentMarkLoading,
        updateAssignmentMarkSuccessMsg: state.updateAssignmentMarkSuccessMsg,
        updateAssignmentMarkErrorMsg: state.updateAssignmentMarkErrorMsg,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchAssignmentResponses: quiz_id => dispatch(fetchAssignmentResponses(quiz_id)),
        updateAssignmentMarks: (assignment_response_id, marks, selectedUserResponse) => dispatch(updateAssignmentMarks(assignment_response_id, marks, selectedUserResponse))
    }
}

const AssignmentResponses = props => {
    const {assignmentId, fetchAssignmentResponses} = props;
    const [responseModalOpen, setResponseModalOpen] = useState(false);
    // const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserResponse, setSelectedUserResponse] = useState([]);
    const [marks, setMarks] = useState("");
    
    useEffect(() => {
        fetchAssignmentResponses(assignmentId);
    }, [fetchAssignmentResponses, assignmentId]);

    const toogleResponseModal = () => {
        setResponseModalOpen(!responseModalOpen);
    }

    const onShowResponseClick = (userId, user_response) => {
        // setSelectedUser(userId);
        setSelectedUserResponse(user_response);
    }
    
    const handleSubmit = e => {
        e.preventDefault();
        props.updateAssignmentMarks(selectedUserResponse.key, marks, selectedUserResponse);
        // if(props.updateAssignmentMarkSuccessMsg !== "" && props.updateAssignmentMarkErrorMsg === "") {
        //     console.log(selectedUserResponse);
        //     selectedUserResponse.marks = marks;
        // }
        toogleResponseModal();
    }

    // console.log(selectedUserResponse);
    
    let data = props.assignmentResponses.map(assignment_response => (
        {
            email: assignment_response.userProfile.email,
            fullName: assignment_response.userProfile.fullName,
            universityId: assignment_response.userProfile.universityId,
            mobileNo: assignment_response.userProfile.mobileNo,
            marks: assignment_response.marks
        }
    ));
    
    let headers = [
        { label: "Email", key: "email" },
        { label: "Full Name", key: "fullName" },
        { label: "Student Id", key: "universityId" },
        { label: "Mobile no", key: "mobileNo" },
        { label: "Marks", key: "marks" }
    ];

    let assignment_responses = props.assignmentResponses.map(assignment_response => {
        // console.log(assignment_response);
        if(assignment_response.user_id === props.userId || props.userId === props.assignmentDetails.data.author_id) {
            return <tr key={assignment_response.key}>
                <th scope="row">{assignment_response.userProfile?.fullName !== "" ?  assignment_response.userProfile?.fullName : assignment_response.userProfile?.email}</th>
                <td><a href={assignment_response.assignmentFileUrl}>Click here to view submission</a></td>
                <td>{assignment_response.marks===""?(<span className="text-danger">pending marks</span>):(<span className="text-success">{assignment_response.marks}</span>)}</td>
                {props.userId === props.assignmentDetails.data.author_id && <td style={{cursor: 'pointer'}} onClick={() => {onShowResponseClick(assignment_response.user_id, assignment_response); toogleResponseModal();}}><FontAwesomeIcon className="mr-3" style={{color: "black"}} icon={faHandPointUp} />Show response</td>}
            </tr>
        } else {
            return null;
        }
    })
    return (
        <div style={{width: "80%", margin: "0 auto"}}>
            {props.updateAssignmentMarkSuccessMsg && <Alert color="success">{props.updateAssignmentMarkSuccessMsg}</Alert>}
            {props.updateAssignmentMarkErrorMsg && <Alert color="danger">{props.updateAssignmentMarkErrorMsg}</Alert>}
            
            <Table bordered className="text-center">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Student's assignment</th>
                        <th>Marks</th>
                        {props.userId === props.assignmentDetails.data.author_id && <th>User response</th>}
                    </tr>
                </thead>
                <tbody>
                    {assignment_responses}
                </tbody>
            </Table>
            {props.userId === props.assignmentDetails.data.author_id && <CSVLink data={data} headers={headers} filename={props.assignmentDetails.data.title+".csv"} className="btn btn-outline-secondary">
                Export as csv
            </CSVLink>}
            <Modal isOpen={responseModalOpen} toggle={toogleResponseModal}>
                <ModalHeader toggle={toogleResponseModal} className="text-success">Give marks to this submission</ModalHeader>
                <ModalBody>
                    <div>
                        <div className="form-group">
                            <label>View submission:</label>&nbsp;
                            <a target="_blank" rel="noreferrer" href={selectedUserResponse?.assignmentFileUrl} className="link-primary" aria-describedby="emailHelp">Click here to view submission</a>
                        </div>
                        {props.userId === props.assignmentDetails.data.author_id && <form onSubmit={e => handleSubmit(e)}>
                            <div className="form-group">
                                <label htmlFor="marks">Marks</label>
                                <div className="d-flex align-items-center">
                                    <input type="number" className="form-control" style={{width: "200px"}} min="0" max={props.assignmentDetails.data.assignmentMarks} id="marks" placeholder="Enter marks" onChange={e => setMarks(e.target.value)} />
                                    <div style={{transform: "rotateY(0deg) rotate(70deg)"}}>
                                        <FontAwesomeIcon icon={faSlash} size="2x" />
                                    </div>
                                    {props.assignmentDetails.data.marks}
                                    <span style={{fontSize: "50px"}}>{props.assignmentDetails.data.assignmentMarks}</span>
                                </div>
                            </div>
                            <ModalFooter>
                                <Button color="primary" disabled={props.updateAssignmentMarkLoading ? true : false}>Submit</Button>
                                <Button color="secondary" onClick={toogleResponseModal} disabled={props.updateAssignmentMarkLoading ? true : false}>Close</Button>
                            </ModalFooter>
                        </form>}
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentResponses);