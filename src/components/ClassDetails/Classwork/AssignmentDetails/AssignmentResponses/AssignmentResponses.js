import React, {useState, useEffect} from 'react';
import './AssignmentResponses.css';
import {connect} from 'react-redux';
import {fetchAssignmentResponses, updateAssignmentMarks} from '../../../../../redux/actionCreators';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import {faHandPointUp} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const mapStateToProps = state => {
    return {
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
    
    const handleSubmit = () => {
        props.updateAssignmentMarks(selectedUserResponse.key, marks, selectedUserResponse);
        // if(props.updateAssignmentMarkSuccessMsg !== "" && props.updateAssignmentMarkErrorMsg === "") {
        //     console.log(selectedUserResponse);
        //     selectedUserResponse.marks = marks;
        // }
        toogleResponseModal();
    }

    console.log(selectedUserResponse);
    
    let assignment_responses = props.assignmentResponses.map(assignment_response => {
        // console.log(assignment_response);
        return <tr key={assignment_response.key}>
          <th scope="row">{assignment_response.userProfile?.fullName !== "" ?  assignment_response.userProfile?.fullName : assignment_response.userProfile?.email}</th>
          <td><a href={assignment_response.assignmentFileUrl}>Click here to view submission</a></td>
          <td>{assignment_response.marks===""?"pending marks":assignment_response.marks}</td>
          <td style={{cursor: 'pointer'}} onClick={() => {onShowResponseClick(assignment_response.user_id, assignment_response); toogleResponseModal();}}><FontAwesomeIcon className="mr-3" style={{color: "black"}} icon={faHandPointUp} />Show response</td>
        </tr>
    })
    return (
        <div>
            {props.updateAssignmentMarkSuccessMsg && <Alert color="success">{props.updateAssignmentMarkSuccessMsg}</Alert>}
            {props.updateAssignmentMarkErrorMsg && <Alert color="danger">{props.updateAssignmentMarkErrorMsg}</Alert>}
            
            <Table bordered>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Student's assignment</th>
                        <th>Marks</th>
                        <th>User response</th>
                    </tr>
                </thead>
                <tbody>
                    {assignment_responses}
                </tbody>
            </Table>
            <Modal isOpen={responseModalOpen} toggle={toogleResponseModal}>
                <ModalHeader toggle={toogleResponseModal} className="text-success">Give marks to this submission</ModalHeader>
                <ModalBody>
                    <div>
                        <div className="form-group">
                            <label>View submission:</label>&nbsp;
                            <a target="_blank" rel="noreferrer" href={selectedUserResponse.assignmentFileUrl} className="link-primary" aria-describedby="emailHelp">Click here to view submission</a>
                        </div>
                        <div className="form-group">
                            <label htmlFor="marks">Marks</label>
                            <input type="number" className="form-control" id="marks" placeholder="Enter marks" onChange={e => setMarks(e.target.value)} />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} disabled={props.updateAssignmentMarkLoading ? true : false}>Submit</Button>
                    <Button color="secondary" onClick={toogleResponseModal} disabled={props.updateAssignmentMarkLoading ? true : false}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentResponses);