import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MyTextInput from './MyTextInput';
import {auth} from '../../redux/actionCreators';
import {Alert, Spinner} from 'reactstrap';

const mapStateToProps = state => {
    return {
        token: state.token,
        userId: state.userId,
        authLoading: state.authLoading,
        authFailedMessage: state.authFailedMessage,
        emailVarificationMsg: state.emailVarificationMsg,
        emailVarificationErrorMsg: state.emailVarificationErrorMsg
    }
}

const mapDispatchToProps = dispatch => {
    return {
        auth: userData => dispatch(auth(userData, 'login'))
    }
}

class Login extends Component {
    render() {
        console.log(this.props.authFailedMessage);
        return (
            <div style={{margin: "0 auto", padding: "20px", width: "700px"}}>
                <h3 className="text-center text-success my-5">Login to join/create classes</h3>
                {this.props.emailVarificationMsg && <Alert color="warning">{this.props.emailVarificationMsg}</Alert>}
                {this.props.emailVarificationErrorMsg && <Alert color="warning">{this.props.emailVarificationErrorMsg}</Alert>}
                {this.props.authFailedMessage !== '' && <Alert color="warning">{this.props.authFailedMessage}</Alert>}
                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                    }}
                    validationSchema={Yup.object({
                        email: Yup.string()
                            .email('Invalid email address')
                            .required('Required'),
                        password: Yup.string().required('Password is required'),
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
                
                        <button type="submit" className="btn btn-sm btn-primary mr-3">Submit</button>
                        {this.props.authLoading && <Spinner color="success" />}
                        <span>Don't have an account?
                            Signup <Link to="/signup">here!</Link>
                        </span>
                    </Form>
                </Formik>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);