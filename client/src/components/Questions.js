import React, {useEffect, useState} from 'react';
import {Carousel, Col, Container, Row} from "react-bootstrap";

import Question from './Question.js';

import {connect} from "react-redux";

import moment from 'moment';

import "./Questions.css";
import {SocketContext} from '../socket';
import Timer from 'react-compound-timer';

const Questions = (props) => {
    const [questions, setQuestions] = useState([]);
    const [questionids, setQuestionIds] = useState([]);
    const [partWrongAnswer, setPartWrongAnswer] = useState([]);
    const [counter, setCounter] = useState(props.questiontime);
    const [answerList, setAnswerList] = useState([]);
    const [knockedOut, setKnockedOut] = useState(false);
    const [finished, setFinished] = useState(false);
    const [inactive, setInactive] = useState(false);
    const [answerListShow, setAnswerListShow] = useState(false);
    const carouselRef = React.createRef()
    const socket = React.useContext(SocketContext)

    const doGetParticipationWrongAnswers = async () => {
        try {
            console.log('getting participation answers');
            const partid = props.participation_id;
            const partsfid = props.partsfid;
            console.log('sfid' + partsfid);
            console.log('getting particiation wrong answers allwoed' + partid);
            const body = {partid};
            const response = await fetch(
                "/participationswronganswer",
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const parseData = await response.json();
            console.log('wrong answer count' + JSON.stringify(parseData));
            console.log('test checking knocked out' + parseData.status__c);
            if (parseData.status__c === 'Knocked Out') {
                console.log('player is knocked out');
                setKnockedOut(true);
                console.log(knockedOut);
            }
            if (parseData.status__c !== 'Active') {
                setInactive(true);
            }
            setPartWrongAnswer(parseData);
            let nonLockedQuestions = 0
            for (const questionElt of questions) {
                console.log(questionElt);
                if(!questionElt.islocked__c)
                    nonLockedQuestions++
                   
            }
            if (questionids.length === props.contest.number_of_questions__c && nonLockedQuestions === 0) {
                setFinished(true);
            }
            console.log(nonLockedQuestions);
            if(nonLockedQuestions > 0) {
              console.log('starting 180 sec timer');
                //startTimer();
                setCounter(180000);
                
            }

        } catch (err) {
            console.error(err.message);
        }
    }
    const startTimer = () => {
        console.log('in non locked questions');
        var questime = props.contest.question_timer__c;
        var millival = questime * 1000;
        var currtime = moment();
        var closedTimerInt = millival + parseInt(props.contest.opened_timer__c);
        console.log(props.contest.opened_timer__c);
        var closedTimerFormat = moment(closedTimerInt);
        console.log(closedTimerInt);
        var counttime = moment.duration(closedTimerFormat.diff(currtime));
        console.log('count time' + counttime);

        if (counttime < 0) {
            setCounter(0);
        } else {
            setCounter(counttime);
        }
    }
    const getQuestions = async () => {
        try {
            console.log('get questions');

            const res = await fetch(`/questions/${props.contestid}`, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            var questionIdArr = [];
            var nonLockedQuestionsArr = [];
            var i = 0;
            for (i = 0; parseData.length > i; i++) {
                questionIdArr.push(parseData[i].sfid);
                console.log(parseData[i].islocked__c);
                if (parseData[i].islocked__c !== true) {
                    nonLockedQuestionsArr.push(parseData[i]);
                }
            }
            setQuestionIds(questionIdArr);
            if (questionIdArr.length === props.contest.number_of_questions__c && nonLockedQuestionsArr.length === 0) {
                //set contest over
                console.log('no more questions, contest is over');
                setFinished(true);

            }
            //if there are questions that aren't locked, then set the timing
            if (nonLockedQuestionsArr.length > 0 && props.contest.opened_timer__c !== null) {
                console.log('starting timer here?');
                setCounter(180000);
                //startTimer()
            } else {
                console.log('no available unlocked questions');
            }
            setQuestions(parseData);
            doGetParticipationWrongAnswers()
        } catch (err) {
            console.error('get questions error' + err.message);
        }
    };

    const clearCounter = async () => {
        try {
            const conid = props.contest.sfid;
            const body = {conid};
            const response = await fetch(
                "/clearcounter",
                {
                    method: "POST",
                    headers: {
                        jwt_token: localStorage.token,
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

        } catch (err) {
            console.log(err.message);
        }
    }

    const disableQuestions = async (questionids) => {
        try {
            const body = {questionids};
            const res = await fetch(`/disableQuestions/`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const parseData = await res.json();
            console.log('before set questions');
            setQuestions(parseData);
            setCounter(0);
            clearCounter();

        } catch (err) {
            console.log('disable questions err : ' + err.message);
        }
    }

    const handleSubmitAnswers = async () => {
        try {
            const partanswers = answerList;
            const body = {partanswers};
            const res = await fetch(`/submitpartanswers`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const parseData = await res.json();
            if (!parseData) {
                setPartWrongAnswer({...partWrongAnswer, wrong_answers__c: ++partWrongAnswer.wrong_answers__c})
            }
            const questionIndex = questions.map(r => {
                return r.sfid
            }).indexOf(partanswers[0].question__c)
            const tempQuestions = questions
            tempQuestions[questionIndex].selection__c = partanswers[0].selection__c
            tempQuestions[questionIndex].selection_value__c = partanswers[0].selection_value__c
            setQuestions(tempQuestions)
            setAnswerListShow(false);
            console.log('before disabling questions')
            disableQuestions(questionids);



            //
        } catch (err) {
            console.log('handle submit answers err : ' + err.message);
        }
    }

    const updateAnswerList = async (childData) => {
        try {
            console.log('update answer list' + answerList);
            //var alist = [];
            console.log('child data' + childData);
            console.log(childData.questionid);
            if (answerList.length < 1) {
                answerList.push(childData);
                console.log('answer list' + answerList);
            } else {

                //if answer list contains a question, then replace it, otherwise add it
                for (var i = 0; i < answerList.length; i++) {
                    if (childData.questionid === answerList[i].questionid) {
                        //replace existing question
                        answerList.splice(i, 1, childData);
                        console.log('here');
                        console.log('answer list' + answerList);
                    }
                }
            }
            setAnswerListShow(true);
            setAnswerList(answerList);
            console.log(answerList);
            console.log('answer list length' + answerList.length);
        } catch (err) {
            console.log('err' + err.message);
        }
    }

    useEffect(() => {
        getQuestions();
        socket.emit("set_contest_room", props.contestid)
    }, []);
    socket.on("new_question", question => {
        console.log('question ' + question.sfid);
        console.log('questionids' + questionids);
        const questionidsIndex = questionids.indexOf(question.sfid)
        console.log(questionidsIndex);
        if(question.indexOf(-1).islocked__c){
            console.log('locked, dont continue');
        }else{
            console.log('not locked, continue');
            
            if (questionidsIndex === -1) {
                setQuestionIds([...questionids, question.sfid]);
                setQuestions([...questions, question]);
            } else {
                const tempQuestions = questions
                tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;
                setQuestions(tempQuestions);
            }
            console.log(questions);
            doGetParticipationWrongAnswers();
        }
       
        
    })
    return (
        <>

            {/* Main Body */}
            <Container>
                <Row className="questionRow m-3 p-3 justify-content-center">
                    {/* slide for questions */}
                    
                    <Col>
                    {questionids.length !== 0 &&
                        <div key={counter}>

                            <Timer initialTime={counter}
                                   direction="backward"
                                   lastUnit="s"
                                   checkpoints={[
                                       {
                                           time: 0,
                                           callback: () => disableQuestions(questionids),
                                       },
                                   ]}
                            >
                                {({start, resume, pause, stop, reset, getTimerState, getTime, setTime}) => (

                                    <React.Fragment>

                                        {/* on timer state of stopped, call the disable function and show answer*/}
                                        <div>
                                            <Timer.Seconds/> Seconds
                                        </div>
                                    </React.Fragment>
                                )}
                            </Timer>
                        </div>
                      }  
                    </Col>
                    {partWrongAnswer.wrong_answers_allowed__c &&
                    <Col>
                        Wrong / Allowed
                        Wrong: {partWrongAnswer.wrong_answers__c} / {partWrongAnswer.wrong_answers_allowed__c}
                    </Col>
                    }
                </Row>
                <Row>
                    <Col>
                        {questions.length > 0 &&
                        <Carousel ref={carouselRef} interval={null}>
                            {questions.map((question, index) => {
                                return <Carousel.Item key={question.id} className="text-center">
                                    <Question addAnswer={updateAnswerList} ques={question} isInactive={inactive}
                                              isKnockedOut={knockedOut} participation_id={props.participation_id}
                                              contestfinsihed={finished} partsfid={props.partsfid}/>
                                </Carousel.Item>
                            })}
                        </Carousel>
                        }

                        {questions.length === 0 &&
                        <div>
                            {props.contestQuestionText}
                        </div>
                        }
                    </Col>
                </Row>
                {questions.length > 0 &&
                <Row className="questionRow m-3 p-3 justify-content-md-center">
                    <Col>
                    </Col>
                    <Col className="align-items-center col-md-auto">
                        <button
                            className={`btn btn-primary submitButton ${answerListShow === false ? "disabledSubmit" : ""}`}
                            onClick={handleSubmitAnswers}>submit answers
                        </button>

                    </Col>
                    <Col>
                    </Col>
                </Row>
                }
            </Container>

        </>
    )
}

export default connect()(Questions);
