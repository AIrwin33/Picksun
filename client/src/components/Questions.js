import React, {useEffect, useState, useRef} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";

import Question from './Question.js';
import Answers from './Answers.js';

import {connect} from "react-redux";

import moment from 'moment';

import "./Questions.css";
import baseball from '../assets/Baseballspinning.gif';
import {SocketContext} from '../socket';
import Timer from 'react-compound-timer';

import $ from 'jquery';



const Questions = (props) => {
    const [questions, setQuestions] = useState([]);
    const [allquestions, setAllQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [questionids, setQuestionIds] = useState([]);
    const [questionNum, setQuestionNum] = useState(1);
    const [selectedCount, setSelectedCount] = useState(0);
    const [subSegmentCount, setSubsegmentCount] = useState(0);
    const [partWrongAnswer, setPartWrongAnswer] = useState([]);
    const [publishedQuestions, setPublishedQuestions] = useState(0);
    const [review, setReview] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [counter, setCounter] = useState(undefined);
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
    const tiRef = useRef(null);

    

    const getAllQuestions = async () => {
        try {
            console.log('get questions');

            const res = await fetch(`/allquestions/${props.contestid}`, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setAllQuestions(parseData);

        } catch (err) {
            console.error('get questions error' + err.message);
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
            //if there are questions that aren't locked, then set the timing based on how much time is left
            if (nonLockedQuestionsArr.length > 0 && props.contest.opened_timer__c !== null) {
                var questime = props.contest.question_timer__c;
                var millival = questime * 1000;
                var currtime = moment();
                var closedTimerInt = millival + parseInt(props.contest.opened_timer__c);
                var closedTimerFormat = moment(closedTimerInt);
                var counttime = moment.duration(closedTimerFormat.diff(currtime));

                if (counttime < 0) {
                    console.log('setting timer?');
                    setCounter(0);
                } else {
                    console.log('setting timer?');
                    setCounter(counttime);
                }
            } else {
                console.log('no available unlocked questions');
            }
            setQuestions(parseData);
            setPublishedQuestions(questions.length);
            doGetParticipationWrongAnswers();
        } catch (err) {
            console.error('get questions error' + err.message);
        }
    };

    // select a question and increment/decrement the question number on the screen
    const handleSelect = (selectedIndex, e) => {
        console.log('hanlde select');
        console.log(selectedIndex);
        setIndex(selectedIndex);
        setQuestionNum(selectedIndex + 1);
        // var nextQues = selectedIndex + 1;
        // if(questions[nextQues] === undefined){
        //     setShowNext(false);
        // }else{
        //     if(!questions[nextQues].islocked__c){
        //         setShowNext(true);
        //     }
        // }
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
            setSocketUpdate(false);
            setShowAnswer(true);
            setShowWaiting(false);
            setReview(false);
            console.log('questions' + JSON.stringify(questions));
            console.log(questions[0]);

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
        if (questions.length === props.contest.number_of_questions__c && nonLockedQuestions === 0) {
            setFinished(true);
        }
        
        setCounter(60000);

    }

    const disableQuestions = async () => {
        try {
            var conid = props.contestid
            const body = {conid};
            const res = await fetch(`/disableQuestions/`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const parseData = await res.json();
            $('.timerdiv').addClass('hiddenTimer');
            setQuestions(parseData);
            setShowWaiting(false);
            setReview(true);

        } catch (err) {
            console.log('disable questions err : ' + err.message);
        }
    }

    const handleSubmitAnswers = async () => {
        try {
            setSubmitted(true);
            setShowWaiting(true);
            console.log('answer list' + JSON.stringify(answerList));
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
            console.log('submit answer' + parseData);
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
            setSelectedCount(1);
            setSubsegmentCount(1);

        } catch (err) {
            console.log('handle submit answers err : ' + err.message);
        }
    }

    const updateAnswerList = async (childData) => {
        try {
            //if the answer list is empty, add the answered question from the Question JS
            if (answerList.length < 1) {
                answerList.push(childData);
            } else {

                //if answer list contains the question answer already, then replace it, otherwise add it
                for (var i = 0; i < answerList.length; i++) {
                    console.log(childData.question__c);
                    console.log(answerList[i].question__c);
                    if (childData.question__c === answerList[i].question__c) {
                        //replace existing question
                        console.log('splice');
                        answerList.splice(i, 1, childData);
                    }else {
                        console.log('add');
                        answerList.push(childData);
                        break;
                    }
                }
            }
            var numplus = index + 1;
            //show next question text on screen if next question is unlocked and not undefined
            for (var k = 0; k < questions.length; k++) {
                if(questions[numplus] !== undefined){
                    if(!questions[numplus].islocked__c && questions[numplus] !== undefined){
                        setShowNext(true);
                    }
                }
            }
            setSelectedCount(selectedCount + 1);


            console.log('answer list' + answerList);
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

    //add warning styling if the timer reaches 10 seconds
    const warningText = async () => {
        console.log('warning, close to time up');
        $('.timerdiv').addClass('warning');
    }

    useEffect(() => {
        console.log('questions use effect');
        getQuestions();
        getAllQuestions();
        socket.emit("set_contest_room", props.contestid)
        
    }, []);
    socket.once("new_question", question => {   
        var questionidsIndex = questionids.indexOf(question.sfid);
        
            if (questionidsIndex === -1) {
                console.log('existing questions' + questions);
                if(questions.length > 0 && questions.length === allquestions.length){
                    console.log('done')
                }else{
                    console.log('add more questions');
                    var newquestions = [];
                    
                    //if there is already a segment published, include old questions
                    if(question.subsegment__c > 1) {
                        newquestions = questions;
                        $('.timerdiv').removeClass('warning');
                        tiRef.current.reset();
                        tiRef.current.start();  
                    }
                    console.log('315' + JSON.stringify(newquestions));
                    var newquestionids = [];
                    for(var i=0; i< allquestions.length; i++){
                        if(allquestions[i].subsegment__c === question.subsegment__c){
                            if(allquestions[i].sfid === question.sfid){
                                console.log('splice');
                                newquestions.splice(i, 1, question);
                                
                            }else{
                                if(allquestions.length === newquestions.length){
                                    console.log('break');
                                    break;
                                }else{
                                    console.log('new question');
                                    newquestions.push(question);
                                    newquestionids.push(question.sfid);
                                    console.log('new questions' + JSON.stringify(newquestions));
                                    console.log('lenght' + newquestions.length);
                                    console.log(newquestions[0]);
                                }
                                
                            }
                        }
                    }
                    console.log('setting');
                    setPublishedQuestions(newquestions.length);
                    setQuestionIds(newquestionids);
                    setQuestions(newquestions);

                    doGetParticipationWrongAnswers();
                    setTimer();
                    $('.timerdiv').removeClass('hiddenTimer');
                }

                
            
                

                
                
        } else {
            if(question.islocked__c){
                console.log('question is locked, dont do anything');
            }else{

                const tempQuestions = questions;
                console.log('temp questions');
                tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;
                setQuestions(tempQuestions);
                doGetParticipationWrongAnswers();
                setTimer();
                $('.timerdiv').removeClass('hiddenTimer');
            }
            
        }
        
    })

    socket.on("cor_question", question => {   
        console.log('in cor question');
        if(!socketUpdate){
            setSocketUpdate(true);
        var tempQuestions = questions;
        console.log('temp questions');
        tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;

        console.log('tempQuestions' + JSON.stringify(tempQuestions));
        setQuestions(tempQuestions);

        console.log(counter);
        doGetParticipationWrongAnswers();
        }
            
        
    })
    return (
        <>

            {/* Show timer and answer count */}
                {questions.length > 0 &&
                <Row className="questionRow m-2 p-2 justify-content-center">
                    {/* slide for questions */}
                    <Col className="d-flex justify-content-start">
                    {questions.length !== 0 &&
                        <div key={counter}>

                            <Timer initialTime={counter}
                                   direction="backward"
                                   lastUnit="s"
                                   ref={tiRef}
                                   checkpoints={[
                                       {
                                           time: 0,
                                           callback: () => disableQuestions(),
                                       },
                                       {
                                           time: 10000,
                                           callback: () => warningText(),
                                       }
                                   ]}
                            >
                                {({start, resume, pause, stop, reset, getTimerState, getTime, setTime, timerState}) => (

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
                    
                    {partWrongAnswer.wrong_answers_allowed__c && showAnswer &&
                    <Col className="d-flex justify-content-end">
                        <Answers wrong={partWrongAnswer.wrong_answers__c} total={partWrongAnswer.wrong_answers_allowed__c}/>
                    </Col>
                    }
                </Row>
                }
                {isShowWaiting &&
                <Row className="questionRow m-2 p-2">
                    <Col>
                        <div className="proxima font16 text-center">
                            {props.contest.waiting_text__c}
                        </div>
                    </Col>
                </Row>
                }
            {isShowWaiting}
            {/* show questions or no question text */}
            {!isShowWaiting &&
            <Row className="questionRow m-2 p-2 justify-content-center">
                
                <Col>
                    {questions.length > 0 && 
                    <Carousel ref={carouselRef} activeIndex={index} onSelect={handleSelect} interval={null}>
                        {questions.map(question => {
                            return <Carousel.Item key={question.id} className="text-center">
                                
                                <Question addAnswer={updateAnswerList} ques={question} contest={props.contest} questionNum={questionNum} totalQuestions={publishedQuestions}
                                            isInactive={inactive}
                                            selectedCount={selectedCount}
                                            getsubcount={handleSubsegmentCount}
                                            isKnockedOut={knockedOut} participation_id={props.participation_id}
                                            contestfinished={finished} partsfid={props.partsfid} issubmitted={submitted}/>
                            </Carousel.Item>
                        })}
                    </Carousel>
                    }

                    {questions.length === 0 &&
                    <div className="greyDiv text-center proxima font16">
                        {props.contestQuestionText}
                    </div>
                    }
                </Col>
            </Row>
            }

            {/* showing submit answers button */}
            {!review && questions.length > 0 &&
                <Row className="questionRow m-2 p-2 justify-content-md-center">
                    <Col className="col-md-auto">
                        {counter > 0 &&
                            <Image width='35' src={baseball}/>
                        }
                    </Col>
                    <Col className="align-items-center col-md-auto">
                        <button
                            className={`btn btn-primary submitButton ${answerListShow === false ? "disabledSubmit" : ""}`}
                            onClick={handleSubmitAnswers}>submit answers
                        </button>

                    </Col>
                    <Col className="col-md-auto">
                        {counter > 0 &&
                            <Image  width='35' src={baseball}/>
                        }
                    </Col>
                </Row>
            }
        </>
    )
}

export default connect()(Questions);
