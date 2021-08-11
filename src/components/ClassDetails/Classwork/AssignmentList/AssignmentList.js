import React, { useEffect } from 'react';
import './AssignmentList.css';
import {Link} from 'react-router-dom';
import {Table} from 'reactstrap';
import { connect } from 'react-redux';
import { fetchAssignments } from '../../../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        classAssignments: state.classAssignments
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchAssignments: clsId => dispatch(fetchAssignments(clsId))
    }
}

const AssignmentList = props => {
    // console.log(props);
    const {clsId, classAssignments, fetchAssignments} = props;

    useEffect(() => {
        fetchAssignments(clsId)
    }, [fetchAssignments, clsId]);

    let sorted_class_assignments = classAssignments.sort((a, b) => {
        return new Date(a.data.dueDate) - new Date(b.data.dueDate);
    });

    let assignment_list = sorted_class_assignments.map((assignment, idx) => {
        console.log(assignment);
        let dueDate = new Date(assignment.data.dueDate);
        return (
            <tr key={assignment.key}>
                <th scope="row">{idx+1}</th>
                <td><Link to={{pathname: `/class/${clsId}/${assignment.key}/assignment`, state: { assignmentDetails: assignment }}}>{assignment.data.title}</Link></td>
                <td>{dueDate.getUTCDate()}/{dueDate.getUTCMonth()+1}/{dueDate.getUTCFullYear()}, {dueDate.toLocaleTimeString()}</td>
                <td></td>
            </tr>
        );
    });

    return (
        <div>
            <h3>Assignment List</h3>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Assignment Title</th>
                        <th>Due Date</th>
                        <th>Status</th>
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