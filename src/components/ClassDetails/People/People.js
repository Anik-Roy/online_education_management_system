import React, {Component} from 'react';
import './People.css';
import {connect} from 'react-redux';
import {fetchClassStudents} from '../../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        classStudents: state.classStudents
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchClassStudents: clsId => dispatch(fetchClassStudents(clsId))
    }
}

class People extends Component {
    
    componentDidMount() {
        this.props.fetchClassStudents(this.props.classId);
    }

    render() {
        console.log(this.props);

        let peoples = this.props.classStudents.map(student => {
            return student.key !== this.props.classTeacherId ? (
                <div key={`student-${student.key}`} className="d-flex flex-row align-items-center m-2">
                    <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                    <span className="ml-4">{student.value.firstName} {student.value.lastName}</span>
                </div>
            ) : null;
        })
        return (
            <div className="people-root">
                {/* Teacher */}
                <div className="teacher">
                    <h3 className="text-primary p-2 border-bottom border-primary">Teachers</h3>
                    <div className="d-flex flex-row align-items-center m-2">
                        <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                        <span className="ml-4">{this.props.classTeacher}</span>
                    </div>
                </div>
                <div  className="teacher mt-5">
                    <h3 className="text-primary mb-4 p-2 border-bottom border-primary">Classmates <span className="float-right">{peoples.length - 1} students</span></h3>
                    {peoples}
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(People);