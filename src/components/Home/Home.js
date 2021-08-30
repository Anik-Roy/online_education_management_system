import React, {Component} from 'react';
import './Home.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Alert } from 'reactstrap';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {connect} from 'react-redux';
import {toogleClassModal, toogleJoinClassModal, toogleUnenrollClassModal, createClass, joinClass, unenrollClass, fetchClass, fetchUserProfile} from '../../redux/actionCreators';
import MyTextInput from '../Auth/MyTextInput';
import ClassCard from '../ClassCard/ClassCard';

const mapStateToProps = state => {
    return {
        userId: state.userId,

        // modal open/hide
        isCreteClassModalOpen: state.isCreteClassModalOpen,
        isJoinClassModalOpen: state.isJoinClassModalOpen,
        isUnenrollClassModalOpen: state.isUnenrollClassModalOpen,
        
        // loading indicator
        isCreateClassLoading: state.isCreateClassLoading,
        isJoinClassLoading: state.isJoinClassLoading,
        fetchClassLoading: state.fetchClassLoading,
        unenrollClassLoading: state.unenrollClassLoading,

        // error message
        joinClassFailedMsg: state.joinClassFailedMsg,
        fetchClassErrorMsg: state.fetchClassErrorMsg,
        selectedClassToUnenroll: state.selectedClassToUnenroll,
        unenrollClassSuccessMsg: state.unenrollClassSuccessMsg,
        unenrollClassErrorMsg: state.unenrollClassErrorMsg,
        joinedAlreadyMsg: state.joinedAlreadyMsg,
        classes: state.classes
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toogleClassModal: () => dispatch(toogleClassModal()),
        toogleJoinClassModal: () => dispatch(toogleJoinClassModal()),
        toogleUnenrollClassModal: () => dispatch(toogleUnenrollClassModal()),
        createClass: (clsData, userId) => dispatch(createClass(clsData, userId)),
        joinClass: (clsCode, userId) => dispatch(joinClass(clsCode, userId)),
        unenrollClass: clsCode => dispatch(unenrollClass(clsCode)),
        fetchClass: userId => dispatch(fetchClass(userId)),
        fetchUserProfile: userId => dispatch(fetchUserProfile(userId))
    }
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }
    
    componentDidMount() {
        this.props.fetchClass(this.props.userId);
        this.props.fetchUserProfile(this.props.userId);
    }

    render() {
        // console.log(this.props.classes);
        let classes = this.props.classes;
        classes = classes.sort((a, b) => {
            return new Date(b.joined_at) - new Date(a.joined_at);
        });

        let classCards = classes.map(cls => {
            return <ClassCard key={cls.key} details={{...cls.value}} enrollId={cls.key} classCode={cls.classCode} unenrollClass={this.props.unenrollClass} />
        });

        return (
            <div className="mt-5">
                {this.props.fetchClassLoading && <div className="text-center"><Spinner color="success" /></div>}
                {this.props.fetchClassErrorMsg !== "" && this.props.fetchClassErrorMsg}
                {this.props.unenrollClassSuccessMsg !== "" && <Alert color="success" style={{width: "315px", margin: "0 auto"}}>{this.props.unenrollClassSuccessMsg}</Alert>}
                {this.props.unenrollClassErrorMsg !== "" && <Alert color="danger">{this.props.unenrollClassErrorMsg}</Alert>}
                {this.props.joinedAlreadyMsg !== "" && <Alert color="info">{this.props.joinedAlreadyMsg}</Alert>}
                {this.props.joinClassFailedMsg !== "" && <Alert color="danger" style={{width: "315px", margin: "0 auto"}}>{this.props.joinClassFailedMsg}</Alert>}
                
                <div className="all-class">
                    {classCards.length === 0 && <Alert className="mx-auto" color="info">You've not joined/created any class yet!</Alert>}
                    {classCards}
                </div>
                {/* Create class modal */}
                <Modal isOpen={this.props.isCreteClassModalOpen} toggle={this.props.toogleClassModal}>
                    <ModalHeader>
                        Create class
                        {
                            this.props.isCreateClassLoading && (<span className="ml-5">
                                <Spinner color="success" />
                            </span>)
                        }
                    </ModalHeader>
                    <ModalBody>
                        <Formik
                            initialValues={{
                                className: '',
                                section: '',
                                subject: '',
                                room: '',
                            }}
                            validationSchema={Yup.object({
                            className: Yup.string()
                                .min(3, 'Must be 3 characters or more')
                                .required('Required'),
                            })}
                            onSubmit={(values, { setSubmitting }) => {
                                this.props.createClass(values, this.props.userId);
                            }}
                        >
                            <Form>
                                <MyTextInput
                                    label="Class Name"
                                    id="className"
                                    name="className"
                                    type="text"
                                    placeholder="Class name"
                                />
                        
                                <MyTextInput
                                    label="Section"
                                    name="section"
                                    type="text"
                                    placeholder="Section name"
                                />
                        
                                <MyTextInput
                                    label="Subject"
                                    name="subject"
                                    type="text"
                                    placeholder="Subject name"
                                />

                                <MyTextInput
                                    label="Room"
                                    name="room"
                                    type="text"
                                    placeholder="Room No."
                                />
                        
                                <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                                {/* <Button color="primary" onClick={this.props.toogleClassModal}>Submit</Button>{' '} */}
                            </Form>
                        </Formik>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.toogleClassModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                
                {/* Join class modal */}
                <Modal isOpen={this.props.isJoinClassModalOpen} toggle={this.props.toogleJoinClassModal}>
                    <ModalHeader>
                        Join class
                        {
                            this.props.isJoinClassLoading && (<span className="ml-5">
                                <Spinner color="success" />
                            </span>)
                        }
                    </ModalHeader>
                    <ModalBody>
                        <div className="border m-2 p-3 rounded">
                            <Formik
                                initialValues={{
                                    classCode: ''
                                }}
                                validationSchema={Yup.object({
                                classCode: Yup.string()
                                    .min(5, 'Must be 5 characters or more')
                                    .required('Required'),
                                })}
                                onSubmit={(values, { setSubmitting }) => {
                                    this.props.joinClass(values.classCode, this.props.userId);
                                }}
                            >
                                <Form>
                                    <MyTextInput
                                        label="Class Code"
                                        id="classCode"
                                        name="classCode"
                                        type="text"
                                        placeholder="Enter the class code"
                                    />
                                    {this.props.joinClassFailedMsg !== "" && <h5 className="container text-danger">{this.props.joinClassFailedMsg}</h5>}
                                    <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                                    {/* <Button color="primary" onClick={this.props.toogleClassModal}>Submit</Button>{' '} */}
                                </Form>
                            </Formik>
                        </div>
                        <div className="p-2">
                            <h5>To sign in with a class code</h5>
                            <ul>
                                <li>Use an authorized account</li>
                                <li>Use a class code with 5-7 letters or numbers, and no spaces or symbols</li>
                            </ul>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.props.toogleJoinClassModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            
                {/* Un-enroll class modal */}
                <Modal isOpen={this.props.isUnenrollClassModalOpen} toggle={this.props.toogleUnenrollClassModal}>
                    <ModalHeader>
                        Unenroll from {this.props.selectedClassToUnenroll?.className} ({this.props.selectedClassToUnenroll?.subject})?
                        {
                            this.props.unenrollClassLoading && (<span className="ml-5">
                                <Spinner color="success" />
                            </span>)
                        }
                    </ModalHeader>
                    <ModalBody>
                        <div className="border m-2 p-3 rounded">
                            <p>You will be removed from this class.</p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button outline color="secondary" onClick={this.props.toogleUnenrollClassModal}>Cancel</Button>
                        <Button outline color="danger" onClick={() => this.props.unenrollClass(this.props.selectedClassToUnenroll?.enrollId)}>Unenroll</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);