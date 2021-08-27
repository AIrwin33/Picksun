import React, {useEffect, useState, useRef} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";

import Question from './Question.js';
import Answers from './Answers.js';

import {connect} from "react-redux";

import moment from 'moment';

import "./Questions.css";
import baseball from '../assets/Baseballspinning.gif';
import hourglass from '../assets/hourglass.png';
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
    const [subsegplusone, setSubSegPlusOne] = useState(0);
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
    const [showKnockOut, setKnockOut] = useState(false);
    const [contestKnockoutText, setContestKnockoutText] = useState([]);
    const [showContestWon, setShowContestWon] = useState(false);
    const [contestWonText, setContestWonText] = useState([]);
    const [showContestFinished, setShowContestFinished] = useState(false);
    const [contestFinishedText, setContestFinishedText] = useState([]);
    const carouselRef = React.createRef()
    const socket = React.useContext(SocketContext);
    const tiRef = useRef(null);
    const [newQuestion, setNewQuestion] = useState()
    const [newCorrectQuestion, setNewCorrectQuestion] = useState()

    const getAllQuestions = async () => {
        try {

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

            const res = await fetch(`/questions/${props.contestid}`, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            var nonLockedQuestionsArr = [];
            var questionIdArr = [];
            for (var i = 0; parseData.length > i; i++) {
                questionIdArr.push(parseData[i].sfid);
                if (parseData[i].islocked__c !== true) {
                    nonLockedQuestionsArr.push(parseData[i]);
                }
            }
            //if there are questions that aren't locked, then set the timing based on how much time is left
            if (nonLockedQuestionsArr.length > 0 && props.contest.opened_timer__c !== null) {
                var questime = props.contest.question_timer__c;
                var millival = questime * 1000;
                var currtime = moment();
                var closedTimerInt = millival + parseInt(props.contest.opened_timer__c);
                var closedTimerFormat = moment(closedTimerInt);
                var counttime = moment.duration(closedTimerFormat.diff(currtime));
                console.log(counttime);
                if (counttime < 0) {
                    console.log('setting timer zero?');
                    setCounter(0);
                    $('.timerdiv').removeClass('hiddenTimer');
    
                } else {
                    console.log('setting timer count time?');
                    setCounter(counttime);
                    $('.timerdiv').removeClass('hiddenTimer');
    
                }
            } else {
                console.log('no available unlocked questions');
            }
            setQuestions(parseData);
            
            //set question num
            setPublishedQuestions(parseData.length);
            doGetParticipationWrongAnswers();
        } catch (err) {
            console.error('get questions error' + err.message);
        }
    };

    const showTimer = async () => {
        $('.timerdiv').removeClass('hiddenTimer');
    }
        

    // select a question and increment/decrement the question number on the screen
    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
        setQuestionNum(selectedIndex + 1);
      };

    const resetLogic = async () => {
        setSubmitted(false);
        setReview(false);
        setShowAnswer(true);
        setShowWaiting(false);
    }

    const doGetParticipationWrongAnswers = async () => {
        try {
            
            const partid = props.participation_id;
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
                handleKnockout();
                
            }
            if (parseData.status__c === 'Inactive') {
                console.log('status inactive');
                setInactive(true);
            }
            console.log('parts wrong' + JSON.stringify(parseData));
            console.log('step 1 : setting wrong answers')
            setPartWrongAnswer(parseData);
            
            props.updatepart(parseData);

        } catch (err) {
            console.error(err.message);
        }
    }

    // const handleFinish = () => {
    //     var questionIdArr = [];
    //     var nonLockedQuestionsArr = [];

    //     for (var i = 0; questions.length > i; i++) {
    //         questionIdArr.push(questions[i].sfid);
    //         if (questions[i].islocked__c !== true) {
    //             nonLockedQuestionsArr.push(questions[i]);
    //         }
    //     }
    //     var answeredQuestionsArr = [];
    //     for (var i = 0; questions.length > i; i++) {
    //         questionIdArr.push(questions[i].sfid);
    //         if (questions[i].correct_answer__c !== null) {
    //             answeredQuestionsArr.push(questions[i]);
    //         }
    //     }
    //     setQuestionIds(questionIdArr);
    //     console.log(answeredQuestionsArr.length);
    //     console.log(props.contest.number_of_questions__c);
    //     if (answeredQuestionsArr.length === props.contest.number_of_questions__c) {
    //         //set contest over
    //         console.log('no more questions, contest is over');
    //         setFinished(true);
    //         setTimeout(
    //             function() {
    //                 console.log('end of contest timeout');
    //                 handleContestEnd();

    //             },
    //             1000
    //         );

    //     }
    // }

    const handleKnockout = async () => {

        //TODO : get place finish when knocked out
        try {
            const partid = props.partsfid;
            const body = {partid};
            const response = await fetch(
                "/knockout",
                {
                    method: "POST",
                    headers: {
                        jwt_token: localStorage.token,
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const parseRes = await response.json();
            // console.log('parseres' + JSON.stringify(parseRes));

            //move this to when knockout is called
            setKnockOut(true);
            setContestKnockoutText(parseRes.knockout_text__c);
        } catch (err) {
            console.error(err.message);
        }

    }

    const handleContestEnd = async () => {
        try {
            console.log('step 1.5: contest is over');
            //check if there are other participations active
            const response = await fetch(
                `/allendingparticipations/` + props.contest.sfid,
                {
                    method: "GET",
                    headers: {
                        jwt_token: localStorage.token,
                        "Content-type": "application/json"
                    }
                }
            );

             const parseRes = await response.json();
            // //returns all remaining participants who aren't knocked out


            // //if you have the least amount of wrong answers, set contest won
            var winningParts = [];
            for (var k = 0; k < parseRes.length; k++) {
                winningParts.push(parseRes[0]);
                if(parseRes[0].wrong_answers__c === parseRes[k].wrong_answers__c && parseRes[0].sfid !== parseRes[k].sfid){
                    console.log('adding to winning participants');
                    winningParts.push(parseRes[k]);
                    
                }
            }
            
            if(partWrongAnswer.status__c === 'Active'){
                if (partWrongAnswer.placefinish__c === 1) {
                    console.log('handling contest won');
                    handleContestWon(winningParts.length);
                }else{
                    console.log('place finish' + partWrongAnswer.placefinish__c);
                    setShowContestFinished(true);
                    setContestFinishedText('Bummer...you didnt get knocked out but there are others who answered more questions correctly than you');
                }

            }

        } catch (err) {
            console.log('err on contest end' + err.message);
        }
    }

    const handleContestWon = async (winnercount) => {
        try {
            const contestid = props.contest.sfid;
            const partsfid = props.partsfid;
            const body = {contestid, partsfid};
            const response = await fetch(
                "/contestwon",
                {
                    method: "POST",
                    headers: {
                        jwt_token: localStorage.token,
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );


            const parseRes = await response.json();
            setShowContestWon(true);

            if(winnercount === 1){
                console.log('single winner');
                setContestWonText("Congratulations, You Won");

            }else{

                console.log('miltiple winner');
                setContestWonText("Congratulations, You Won with some other folks");
            }

        } catch (err) {
            console.error(err.message);
        }

    }

    const setTimer = () => {
        console.log('set timer');
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
            $('.carousel-control-next-icon').removeClass('active');
            setIndex(subsegplusone);
            setQuestionNum(subsegplusone + 1);
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
            setQuestions(tempQuestions);
            setAnswerListShow(false);
            setSelectedCount(0);
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
                setSelectedCount(selectedCount + 1);
            } else {

                //if answer list contains the question answer already, then replace it, otherwise add it
                for (var i = 0; i < answerList.length; i++) {
                    if (childData.question__c === answerList[i].question__c) {
                        //replace existing question
                        answerList.splice(i, 1, childData);
                    } else {
                        answerList.push(childData);
                        setSelectedCount(selectedCount + 1);
                        break;
                    }
                }
            }
            setAnswerList(answerList);
            console.log(selectedCount);
            console.log(subSegmentCount);
            if(selectedCount === subSegmentCount){
                setAnswerListShow(true);
            }
        } catch (err) {
            console.log('err' + err.message);
        }
    }

    const handleSubsegmentCount = async (subseg) => {
        var minussubseg = questions.length - subseg;
        setSubSegPlusOne(minussubseg);
        setIndex(minussubseg);
        setSubsegmentCount(subseg);
        if(minussubseg > 1){
            setQuestionNum(subseg + 1);
        }
    }

    //add warning styling if the timer reaches 10 seconds
    const warningText = async () => {
        $('.timerdiv').addClass('warning');
    }

    useEffect(() => {
        console.log('questions use effect');
        getQuestions();
        getAllQuestions();
        
        if(newQuestion !== props.newQuestion && props.newQuestion !== undefined) {
            console.log('in set new question');
            setNewQuestion(props.newQuestion)
            addNewQuestion(props.newQuestion)
            
        }
        if(newCorrectQuestion !== props.newCorrectQuestion && props.newCorrectQuestion !== undefined) {
            setNewQuestion(props.newCorrectQuestion)
            addCorrectQuestion(props.newCorrectQuestion)
        }
        if(props.newCorrectQuestion === undefined && props.newQuestion === undefined){
            console.log('resetting');
            setReview(true);
            setShowAnswer(true);
            console.log($('.timerdiv'));
            $('.timerdiv').removeClass('hiddenTimer');
        }
    }, [props.newQuestion, props.newCorrectQuestion]);
    const addNewQuestion = question => {
        //make sure sfid is being returned
        console.log('question in add new question' + question);
        var questionidsIndex = questionids.indexOf(question.sfid);
        if (questionidsIndex === -1) {
            if (questions.length > 0 && questions.length === allquestions.length) {
            } else {
                var newquestions = questions;
                doGetParticipationWrongAnswers();

                //if there is already a segment published, include old questions
                if (question.subsegment__c > 1) {

                    $('.timerdiv').removeClass('warning');
                    tiRef.current.reset();
                    tiRef.current.start();
                }
                var newquestionids = [];
                for (var i = 0; i < allquestions.length; i++) {
                    if (allquestions[i].subsegment__c === question.subsegment__c) {
                        //if the question is already there
                        if (newquestions.length > i) {
                            if (newquestions[i].sfid === question.sfid) {
                                newquestions.splice(i, 1, question);
                                    continue;
                                }

                        }
                        if (allquestions[i].sfid === question.sfid) {
                            if (allquestions.length === newquestions.length) {
                                break;
                            } else {
                                newquestions.push(question);
                                newquestionids.push(question.sfid);
                            }

                        }
                    }
                }

                setPublishedQuestions(newquestions.length);
                setQuestionIds(newquestionids);
                setQuestions(newquestions);
                setTimer();
                $('.timerdiv').removeClass('hiddenTimer');
                resetLogic();
            }

        } else {
            if(question.islocked__c){
                console.log('question is locked, dont do anything');
            }else{
                console.log('question not locked');
                console.log(question.islocked__c);
                doGetParticipationWrongAnswers();
                const tempQuestions = questions;
                console.log('temp questions');
                tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;
                setQuestions(tempQuestions);
                setIndex(subsegplusone);
                
                setTimer();
                console.log('question num' + subsegplusone);
            }

        }

    }
    const addCorrectQuestion = question => {
        console.log('in cor question');
        doGetParticipationWrongAnswers();
        var tempQuestions = questions;
        tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;

        console.log('tempQuestions' + JSON.stringify(tempQuestions));
        setQuestions(tempQuestions);
        
        if(props.contest.status__c === 'Finished'){
            console.log('end of contest');
            handleContestEnd();
        }else{
            console.log('continue');
        }
    }

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
                                        <div className="timerdiv font20 hiddenTimer">
                                            {counter > 0 &&
                                                <Image width='20' src={baseball}/>
                                            }
                                            <Timer.Seconds/> Seconds

                                            {counter > 0 &&
                                                <Image width='20' src={baseball}/>
                                            }
                                        </div>
                                    </React.Fragment>
                                )}
                            </Timer>
                        </div>
                      }
                    </Col>

                    {partWrongAnswer.wrong_answers_allowed__c && showAnswer &&
                    <Col className="justify-content-end">
                        <Answers wrong={partWrongAnswer.wrong_answers__c} total={partWrongAnswer.wrong_answers_allowed__c}/>
                    </Col>
                    }
                </Row>
                }
                {isShowWaiting &&
                <Row className="questionRow m-2 p-2">
                    <Col>
                        <div className="proxima font16 text-center">
                            <img width="30" src={hourglass}/>
                            
                            <span>
                                {props.contest.waiting_text__c}

                            </span>
                        </div>
                    </Col>
                </Row>
                }
            {/* show questions or no question text */}
            {!isShowWaiting &&
            <Row className="questionRow m-2 p-2 justify-content-center">

                <Col>
                    {questions.length > 0 &&
                    <Carousel className="carouselDiv" ref={carouselRef} activeIndex={index} onSelect={handleSelect} interval={null}
                              data-slide-to={index}>
                        {questions.map(question => {
                            return <Carousel.Item key={question.id} className="text-center">
                                <Question addAnswer={updateAnswerList} ques={question} contest={props.contest} questionNum={questionNum} totalQuestions={publishedQuestions}
                                            isInactive={inactive}
                                            selectedCount={selectedCount}
                                            getsubcount={handleSubsegmentCount}
                                            isKnockedOut={knockedOut} participation_id={props.participation_id}
                                            contestfinished={finished} partsfid={props.partsfid}/>
                            </Carousel.Item>
                        })}
                    </Carousel>
                    }

                    {questions.length === 0 &&
                    <div className="greyDiv text-center proxima font16">
                        {props.contestQuestionText}
                    </div>
                    }

                    <div
                    className="questionRow m-3 justify-content-center p-3">
                    {(props.isKnockedOut === true || showKnockOut === true) &&
                    <Row>
                        <div className="text-center">
                            <span>{contestKnockoutText}</span>
                        </div>
                    </Row>
                    }

                    {(props.isContestWon == true || showContestWon == true) &&
                    <Row>
                        <div className="text-center">
                            <span>{contestWonText}</span>
                        </div>
                    </Row>
                    }

                    {(props.isContestFinished == true || showContestFinished == true) &&
                    <Row>
                        <div className="text-center">
                            <span>{contestFinishedText}</span>
                        </div>
                    </Row>
                    }
                    </div>
                </Col>
            </Row>
            }

            {/* showing submit answers button */}
            {!review && !submitted && questions.length > 0 &&
                <Row className="questionRow m-2 p-2 justify-content-center">
                    <Col className="col-md-auto col-sm-auto">
                        {counter > 0 && answerListShow &&
                            <Image width='35' src={baseball}/>
                        }
                    </Col>
                    <Col className="align-items-center col-md-auto col-sm-auto">
                        <button
                            className={`btn btn-primary submitButton ${answerListShow === false ? "disabledSubmit" : ""}`}
                            onClick={handleSubmitAnswers}>submit answers
                        </button>
                    </Col>
                    <Col className="col-md-auto col-sm-auto">
                        {counter > 0 && answerListShow &&
                            <Image  width='35' src={baseball}/>
                        }
                    </Col>
                </Row>
            }
        </>
    )
}

export default connect()(Questions);
