import React, {Component} from 'react';
import './ClassDetails.css';
import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane} from '@fortawesome/free-solid-svg-icons';

class ClassDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
        };
    }
    
    onEditorStateChange = editorState => {
        this.setState({
            editorState,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        console.log('clicked!');
        let rawData = convertToRaw(this.state.editorState.getCurrentContent());
        console.log(rawData);
    }

    render() {
        const { editorState } = this.state;
        console.log(this.state);
        return (
            <div className="root">
                <div className="banner-top">
                    <h3>MIT 621: Information and Cyber Security</h3>
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
                                />
                            </div>
                            
                            <Button onClick={this.handleSubmit} outline color="success" className="mt-3">Submit</Button>
                        </div>
                        <div className="class-content border mt-4">
                            <div className="publisher-info">
                                <img width="50px" height="50px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                                <div className="publisher-name ml-2">
                                    <h5>Shahidur Rahman</h5>
                                    <span>Jun 16</span>
                                </div>
                            </div>
                            <div className="content-text mt-3">
                                <p>Lecture on Security Technologies</p>
                            </div>
                            <div className="attached-contents">
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                                <div className="attached-content border">
                                    <div className="attached-thumbnail">
                                        <img width="100%" height="100%" src="https://play-lh.googleusercontent.com/nufRXPpDI9XP8mPdAvOoJULuBIH_OK4YbZZVu8i_-eDPulZpgb-Xp-EmI8Z53AlXHpqX" alt="thumbnail" />
                                    </div>
                                    <div className="attach-details">
                                        <h5>Lecture 6.pdf</h5>
                                        <p>PDF</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border"></div>
                            <div className="comment-form-box">
                                <img width="30px" height="30px" className="rounded-circle" src="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s75-c-fbw=1/photo.jpg" alt="profile-pic" />    
                                <div className="comment-input-container ml-2 border">
                                    <input type="text" name="comment" placeholder="Add class comment" />
                                    <FontAwesomeIcon icon={faPaperPlane} style={{margin: "20px", color: "#9AA0A6"}} />
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ClassDetails;