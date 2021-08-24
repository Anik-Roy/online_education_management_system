import React, { useState, useEffect } from 'react';
import './AssignmentList.css';
import {Link} from 'react-router-dom';
import {faDownload} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Table, Spinner} from 'reactstrap';
import { connect } from 'react-redux';
import { fetchAssignments, fetchAssignmentResponses } from '../../../../redux/actionCreators';
import { CSVLink } from "react-csv";
import axios from 'axios';

let _ = require('lodash');

const mapStateToProps = state => {
    return {
        userId: state.userId,
        classAssignments: state.classAssignments,
        assignmentResponses: state.assignmentResponses,
        fetchAssignmentResponsesLoading: state.fetchAssignmentResponsesLoading
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchAssignments: clsId => dispatch(fetchAssignments(clsId)),
        fetchAssignmentResponses: assignment_id => dispatch(fetchAssignmentResponses(assignment_id))
    }
}

const AssignmentList = props => {
    // console.log(props);
    const {clsId, classAssignments, fetchAssignments} = props;
    let [selectedAssignment, setSelectedAssignment] = useState(null);
    let [userAssignmentResponses, setUserAssignmentResponses] = useState([]);

    useEffect(() => {
        fetchAssignments(clsId)
    }, [fetchAssignments, clsId]);

    useEffect(() => {
        axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/assignment_responses.json?orderBy="user_id"&equalTo="${props.userId}"`)
            .then(response => {
                console.log(response);
                let user_responses = [];
                Object.keys(response.data).map(key => {
                    console.log(response.data[key]);
                    user_responses.push({key, ...response.data[key]});
                    return true;
                });
                console.log(user_responses);
                setUserAssignmentResponses(user_responses);
            })
            .catch(error => {
                console.log(error);
            })
    }, [props.userId]);

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

    let sorted_class_assignments = classAssignments.sort((a, b) => {
        return new Date(a.data.dueDate) - new Date(b.data.dueDate);
    });

    let assignment_list = sorted_class_assignments.map((assignment, idx) => {
        // console.log(assignment);
        let dueDate = new Date(assignment.data.dueDate);
        return (
            <tr key={assignment.key}>
                <th scope="row">{idx+1}</th>
                <td><Link to={{pathname: `/class/${clsId}/${assignment.key}/assignment`, state: { assignmentDetails: assignment, classTeacher: props.classTeacher }}}>{assignment.data.title}</Link></td>
                <td>{dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}</td>
                {props.userId !== props.classTeacher && <td>
                    {_.find(userAssignmentResponses, {assignment_id: assignment.key}) ? "submitted" : "not submitted"}
                </td>}
                {props.userId === props.classTeacher && <td>
                    {/* <button className="btn btn-outpine-secondary" onClick={() => console.log(quiz)}>Export as csv</button> */}
                    <FontAwesomeIcon icon={faDownload} style={{fontSize: "18px"}} onClick={() => {setSelectedAssignment(assignment.key); props.fetchAssignmentResponses(assignment.key)}} />&nbsp;
                    {props.fetchAssignmentResponsesLoading === true && selectedAssignment === assignment.key && <Spinner color="success" />}
                    {props.fetchAssignmentResponsesLoading === false && props.assignmentResponses.length === 0 && selectedAssignment === assignment.key && <span>No response submitted!</span>}
                    {props.fetchAssignmentResponsesLoading === false && props.assignmentResponses.length > 0 && selectedAssignment === assignment.key && <CSVLink
                        data={data}
                        headers={headers}
                        filename={assignment.data.title+".csv"}
                        className="btn btn-outline-secondary">
                        Export as csv
                    </CSVLink>}
                </td>}
            </tr>
        );
    });

    return (
        <div>
            <h3>Assignment List</h3>
            <Table className="text-center">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Assignment Title</th>
                        <th>Due Date</th>
                        {props.userId !== props.classTeacher && <th>Status</th>}
                        {props.userId === props.classTeacher && <th>Download Result</th>}
                    </tr>
                </thead>
                <tbody>
                    {assignment_list}
                </tbody>
            </Table>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentList);