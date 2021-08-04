import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MyTextInput from './MyTextInput';
import { connect } from 'react-redux';
import { auth } from '../../redux/actionCreators';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';

const mapStateToProps = state => {
    return {
        token: state.token,
        userId: state.userId,
        authLoading: state.authLoading,
        authFailedMessage: state.authFailedMessage,
        sendEmailVarificationSuccessMsg: state.sendEmailVarificationSuccessMsg,
        sendEmailVarificationErrorMsg: state.sendEmailVarificationErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        auth: userData => dispatch(auth(userData, 'signup'))
    }
}

class Signup extends Component {
    render() {
        return (
            <div style={{margin: "0 auto", padding: "20px", width: "700px"}}>
                <h3 className="text-center text-success my-5">Signup to join/create classes</h3>
                {(this.props.sendEmailVarificationSuccessMsg || this.props.sendEmailVarificationErrorMsg) && <div className="p-3 bg-primary my-2 rounded">
                    <Toast>
                        <ToastHeader>
                            Email varification
                        </ToastHeader>
                        <ToastBody>
                            {this.props.sendEmailVarificationSuccessMsg}
                            {this.props.sendEmailVarificationErrorMsg}
                        </ToastBody>
                    </Toast>
                </div>}
                <Formik
                    initialValues={{
                        fullName: '',
                        email: '',
                        password: '',
                        passwordConfirmation: '',
                    }}
                    validationSchema={Yup.object({
                    fullName: Yup.string()
                        .max(15, 'Must be less than or equal 20 characters!')
                        .required('Required'),
                    email: Yup.string()
                        .email('Invalid email address')
                        .required('Required'),
                    password: Yup.string().required('Password is required'),
                    passwordConfirmation: Yup.string()
                        .oneOf([Yup.ref('password'), null], 'Passwords must match')
                    })}
                    onSubmit={(values, { setSubmitting }) => {
                        this.props.auth(values);
                        // setTimeout(() => {
                        //     alert(JSON.stringify(values, null, 2));
                        //     setSubmitting(false);
                        // }, 400);
                    }}
                >
                    <Form>
                        <MyTextInput
                            label="Full Name"
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Jane Doe"
                        />
                
                        <MyTextInput
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="jane@formik.com"
                        />

                        <MyTextInput
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Type a password"
                        />

                        <MyTextInput
                            label="Confirm password"
                            name="passwordConfirmation"
                            type="password"
                            placeholder="Re-type your password"
                        />
                
                        <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                        <span>Already have an account?
                            Login <Link to="/login">here!</Link>
                        </span>
                    </Form>
                </Formik>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);