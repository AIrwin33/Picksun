import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row} from "react-bootstrap";

import Question from './Question.js';

import {connect} from "react-redux";

import moment from 'moment';

import "./Questions.css";
import {SocketContext} from '../socket';
import Timer from 'react-compound-timer';

import $ from 'jquery';

const Questions = (props) => {
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [questionids, setQuestionIds] = useState([]);
    const [questionNum, setQuestionNum] = useState(1);
    const [selectedCount, setSelectedCount] = useState(0);
    const [subSegmentCount, setSubsegmentCount] = useState(0);
    const [partWrongAnswer, setPartWrongAnswer] = useState([]);
    const [counter, setCounter] = useState(props.questiontime);
    const [answerList, setAnswerList] = useState([]);
    const [showNext, setShowNext] = useState(false);
    const [knockedOut, setKnockedOut] = useState(false);
    const [finished, setFinished] = useState(false);
    const [inactive, setInactive] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isShowWaiting, setShowWaiting] = useState(false);
    const [answerListShow, setAnswerListShow] = useState(false);
    const [socketUpdate, setSocketUpdate] = useState(false);
    const carouselRef = React.createRef()
    const socket = React.useContext(SocketContext);

    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
        setQuestionNum(selectedIndex + 1);
        var nextQues = selectedIndex + 1;
        if(questions[nextQues] === undefined){
            setShowNext(false);
        }else{
            if(!questions[nextQues].islocked__c){
                setShowNext(true);
            }
        }
      };

    const doGetParticipationWrongAnswers = async () => {
        try {
            console.log('getting participation answers');
            const partid = props.participation_id;
            const partsfid = props.partsfid;
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
            if (parseData.status__c === 'Knocked Out') {
                console.log('player is knocked out');
                setKnockedOut(true);
            }
            if (parseData.status__c !== 'Active') {
                console.log('status active');
                setInactive(true);
            }
            setPartWrongAnswer(parseData);
            console.log('before update part');
            setSocketUpdate(false);
            props.updatepart(parseData);  

        } catch (err) {
            console.error(err.message);
        }
    }

    const setTimer = () => {
        let nonLockedQuestions = 0;
            for (const questionElt of questions) {
                if(!questionElt.islocked__c)
                    nonLockedQuestions++
                
            }
        if (questionids.length === props.contest.number_of_questions__c && nonLockedQuestions === 0) {
            setFinished(true);
        }
            setCounter(60000);
            setIndex(questions.length);

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
                console.log('starting timer here in getQuestions');
                setCounter(60000);
            } else {
                console.log('no available unlocked questions');
            }
            setQuestions(parseData);
            let nonLockedQuestions = 0;
            for (const questionElt of questions) {
                console.log(questionElt);
                if(!questionElt.islocked__c)
                    nonLockedQuestions++
                
            }
            if(nonLockedQuestions > 0){
                setTimer();
            }
            doGetParticipationWrongAnswers();
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

    const disableQuestions = async (ids) => {
        try {
            console.log(ids);
            const body = {ids};
            const res = await fetch(`/disableQuestions/`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const parseData = await res.json();
            console.log(parseData);
            setQuestions(parseData);
            console.log(isShowWaiting);
            console.log(questions.length);
            //clearCounter();

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
            setSubmitted(true);
            //reset count
            setSelectedCount(1);
            setSubsegmentCount(1);
            setShowWaiting(true);
        } catch (err) {
            console.log('handle submit answers err : ' + err.message);
        }
    }

    const updateAnswerList = async (childData) => {
        try {
            console.log('in update answer list' + answerList);
            console.log('child data' + childData);
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

            var numplus = index + 1;
            for (var k = 0; k < questions.length; k++) {
                if(questions[numplus] !== undefined){
                    if(!questions[numplus].islocked__c && questions[numplus] !== undefined){
                        setShowNext(true);
                    }
                }
            }
            setSelectedCount(selectedCount + 1);
            setAnswerList(answerList);
            if(selectedCount + 1 === subSegmentCount){
                setAnswerListShow(true);
            }
        } catch (err) {
            console.log('err' + err.message);
        }
    }

    const handleSubsegmentCount = async (subseg) => {
        setSubsegmentCount(subseg);
    }

    const warningText = async () => {
        console.log('warning, close to time up');
        $('.timerdiv').addClass('warning');
    }

    useEffect(() => {
        getQuestions();
        socket.emit("set_contest_room", props.contestid)
    }, []);
    socket.once("new_question", question => {
        console.log('question once' + question.sfid);
    
        console.log('socket update' + socketUpdate);    
        
        const questionidsIndex = questionids.indexOf(question.sfid);
        if(!socketUpdate){
            setSocketUpdate(true);
            if (questionidsIndex === -1) {
                
                console.log('socket update' + socketUpdate);   
                console.log('not temp questions');
                setQuestionIds([...questionids, question.sfid]);
                setQuestions([...questions, question]);
                doGetParticipationWrongAnswers();
                setTimer();
                
                
                
            } else {
                const tempQuestions = questions;
                console.log('temp questions');
                tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;
                setQuestions(tempQuestions);
                doGetParticipationWrongAnswers();
                setTimer();
                
            }
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
                                       {
                                           time: 10000,
                                           callback: () => warningText(),
                                       }
                                   ]}
                            >
                                {({start, resume, pause, stop, reset, getTimerState, getTime, setTime}) => (

                                    <React.Fragment>

                                        {/* on timer state of stopped, call the disable function and show answer*/}
                                        <div className="timerdiv">
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
                        Wrong Answers / Allowed: {partWrongAnswer.wrong_answers__c} / {partWrongAnswer.wrong_answers_allowed__c}
                    </Col>
                    }
                </Row>
                {isShowWaiting &&
                <Row>
                    <Col>
                        <div>
                            Wait for all other players to lock in their scores
                        </div>
                    </Col>
                </Row>
                }
                
                <Row>
                    <Col>
                        {questions.length > 0 && !isShowWaiting &&
                        <Carousel ref={carouselRef} activeIndex={index} onSelect={handleSelect} interval={null}>
                            {questions.map((question, index) => {
                                return <Carousel.Item key={question.id} className="text-center">
                                    <Question addAnswer={updateAnswerList} ques={question} contest={props.contest} questionNum={questionNum} totalQuestions={props.contest.number_of_questions__c}
                                                isInactive={inactive}
                                                selectedCount={selectedCount}
                                                getsubcount={handleSubsegmentCount}
                                                doShowNext={showNext}
                                              isKnockedOut={knockedOut} participation_id={props.participation_id}
                                              contestfinsihed={finished} partsfid={props.partsfid} issubmitted={submitted}/>
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
                {questions.length > 0 && !isShowWaiting &&
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
