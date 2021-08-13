import React, {Component} from 'react';
import './QuizChart.css';
import { Line, Bar } from 'react-chartjs-2';
import {connect} from 'react-redux';
import axios from 'axios';
import {fetchQuizResponses} from '../../../../../redux/actionCreators';

const mapStateToProps = state => {
    return {
        quizResponses: state.quizResponses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchQuizResponses: quiz_id => dispatch(fetchQuizResponses(quiz_id))
    }
}

class QuizChart extends Component {
    state = {
        marksChartData: {
            // labels: ['# no of students 1', '# no of students 2', '# no of students 3', '# no of students 4', '# no of students 5'],
            datasets: [
                {
                    label: 'Total correct',
                    data: [],
                    backgroundColor: [
                            '#81C784',
                    ]
                }
            ]
        },
        correctAnswerChartData: {
            labels: [],
            datasets: [
                {
                    label: 'Total correct',
                    data: [],
                    backgroundColor: [
                        // 'rgba(255, 99, 132, 0.6)',
                        // 'rgba(54, 162, 235, 0.6)',
                        // 'rgba(255, 206, 86, 0.6)',
                        '#81C784',
                        // 'rgba(153, 102, 255, 0.6)'
                    ]
                }
            ]
        },
        wrongAnswerChartData: {
            labels: ['Question 1', 'Question 2', 'Question 3', 'Question 4', 'Question 5'],
            datasets: [
                {
                    label: 'Total wrong',
                    data: [10, 2, 12, 3, 15],
                    backgroundColor: [
                        '#F44336'
                    ]
                }
            ]
        }
    }

    componentDidMount() {
        axios.get(`https://sust-online-learning-default-rtdb.firebaseio.com/quiz_responses.json?orderBy="quiz_id"&equalTo="${this.props.quizId}"`)
        .then(async response => {
            let quiz_responses_list = [];

            Object.keys(response.data).map(async key => {
                let quiz_response =  { ...response.data[key] };  
                quiz_responses_list.push(quiz_response);
                // return quiz_response;
                return true;
            });

            let lineMap = new Map();
            
            let correctAnswerLabels = [];
            let correctAnswerData = [];
            let correctAnswerMap = new Map();

            let wrongAnswerLabels = [];
            let wrongAnswerData = [];
            let wrongAnswerMap = new Map();

            quiz_responses_list.map(res => {
                // for line chart
                let tot_student = lineMap.get(res.total_correct);
                
                if(tot_student === undefined) {
                    lineMap.set(res.total_correct, 1);
                } else {
                    lineMap.set(res.total_correct, tot_student+1);
                }

                // for correct and wrong answer chart
                res.user_answer.map((answer, idx) => {
                    // correct answer
                    let correct = correctAnswerMap.get(`question${idx+1}`);  
                    if(correct === undefined) {
                        correctAnswerMap.set(`question${idx+1}`, 0);
                    }
                    correct = correctAnswerMap.get(`question${idx+1}`);
                    if(answer === this.props.quizDetails.data.quiz_questions[idx].answer) {
                        correctAnswerMap.set(`question${idx+1}`, correct+1);
                    }

                    // wrong answer
                    let wrong = wrongAnswerMap.get(`question${idx+1}`);  
                    if(wrong === undefined) {
                        wrongAnswerMap.set(`question${idx+1}`, 0);
                    }
                    wrong = wrongAnswerMap.get(`question${idx+1}`);
                    if(answer !== this.props.quizDetails.data.quiz_questions[idx].answer) {
                        wrongAnswerMap.set(`question${idx+1}`, wrong+1);
                    }
                    return true;
                });
                return true;
            });

            // for line chart
            let data = [];
            for(const [key, value] of lineMap) {
                data.push({id: '# marks '+key, nested: {value: value}});
            }

            for(const [key, value] of correctAnswerMap) {
                correctAnswerLabels.push(key);
                correctAnswerData.push(value);
            }

            for(const [key, value] of wrongAnswerMap) {
                wrongAnswerLabels.push(key);
                wrongAnswerData.push(value);
            }


            this.setState({
                marksChartData: {
                    datasets: [
                        {
                            label: 'Total students',
                            data: data,
                            backgroundColor: [
                                    '#81C784',
                            ],
                            borderColor: "#81C784"
                        }
                    ]
                },
                correctAnswerChartData: {
                    labels: correctAnswerLabels,
                    datasets: [
                        {
                            label: 'Total correct',
                            data: correctAnswerData,
                            backgroundColor: [
                                '#81C784'
                            ]
                        }
                    ]
                },
                wrongAnswerChartData: {
                    labels: wrongAnswerLabels,
                    datasets: [
                        {
                            label: 'Total wrong',
                            data: wrongAnswerData,
                            backgroundColor: [
                                '#F44336'
                            ]
                        }
                    ]
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
    
    render() {
        // console.log(this.props.quizDetails);
        const marksChartOptions = {
            scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    callback: function(value) {
                        console.log(value);
                        if (value % 1 === 0) {return value;} else {return "";}}
                  }
                }]
            },
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            parsing: {
                xAxisKey: 'id',
                yAxisKey: 'nested.value'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Students marks',
                    fontSize: 25
                },
                legend: {
                    display: true,
                    position: 'left'
                }
            }
        };

        const correctAnswerChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            plugins: {
                title: {
                    display: true,
                    text: 'Correct answer stats',
                    fontSize: 25
                },
                legend: {
                    display: true,
                    position: 'left'
                }
            }
        };

        const wrongAnswerChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 2,
            plugins: {
                title: {
                    display: true,
                    text: 'Wrong answer stats',
                    fontSize: 25
                },
                legend: {
                    display: true,
                    position: 'left'
                }
            }
        };

        return (
            <div className="container">
                <div className="chart-container" style={{position: "relative", height: "50vh", width: "80vw"}}>
                    <Line  data={this.state.marksChartData} options={marksChartOptions} />
                </div>
                <hr />
                <div className="chart-container" style={{position: "relative", height: "70vh", width: "80vw"}}>
                    <Bar
                        data={this.state.correctAnswerChartData}
                        options={correctAnswerChartOptions}/>
                </div>
                <hr />
                <div className="chart-container" style={{position: "relative", height: "70vh", width: "80vw"}}>
                    <Bar
                        data={this.state.wrongAnswerChartData}
                        options={wrongAnswerChartOptions}/>
                </div> 
            </div>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(QuizChart);