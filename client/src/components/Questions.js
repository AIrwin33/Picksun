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
    const [socketUpdate, setSocketUpdate] = useState(false);
    const carouselRef = React.createRef()
    const socket = React.useContext(SocketContext);
    const tiRef = useRef(null);
    const [newQuestion, setNewQuestion] = useState()
    const [newCorrectQuestion, setNewCorrectQuestion] = useState()

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
                console.log('new questions, get time');
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
                } else {
                    console.log('setting timer count time?');
                    setCounter(counttime);
                }
            } else {
                console.log('no available unlocked questions');
            }
            console.log('removing timer');
            if(nonLockedQuestionsArr.length > 0) {
                showTimer();
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
        console.log('hanlde select');
        console.log(selectedIndex);
        setIndex(selectedIndex);
        setQuestionNum(selectedIndex + 1);
      };

    const resetLogic = async () => {
        console.log('reset logic');
        setSubmitted(false);
        setReview(false);
        setShowAnswer(true);
        setShowWaiting(false);
    }

    const doGetParticipationWrongAnswers = async () => {
        try {
            console.log('getting participation answers');
            
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
            console.log('running');
            if (parseData.status__c === 'Knocked Out') {
                console.log('player is knocked out');
                setKnockedOut(true);
            }
            if (parseData.status__c !== 'Active') {
                console.log('status active');
                setInactive(true);
            }
            setPartWrongAnswer(parseData);
            if(questions.length === props.contest.number_of_questions__c){
                console.log('end of contest');
                handleFinish();
            }
            props.updatepart(parseData);

        } catch (err) {
            console.error(err.message);
        }
    }

    const handleFinish = () => {
        var questionIdArr = [];
        var nonLockedQuestionsArr = [];

        for (var i = 0; questions.length > i; i++) {
            questionIdArr.push(questions[i].sfid);
            if (questions[i].islocked__c !== true) {
                nonLockedQuestionsArr.push(questions[i]);
            }
        }
        var answeredQuestionsArr = [];
        for (var i = 0; questions.length > i; i++) {
            questionIdArr.push(questions[i].sfid);
            if (questions[i].correct_answer__c !== null) {
                answeredQuestionsArr.push(questions[i]);
            }
        }
        console.log('questions answered array' + answeredQuestionsArr);
        setQuestionIds(questionIdArr);
        if (answeredQuestionsArr.length === props.contest.number_of_questions__c) {
            //set contest over
            console.log('no more questions, contest is over');
            setFinished(true);
            handleContestEnd();

        }
    }

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
            console.log('parseres' + JSON.stringify(parseRes));
            setKnockOut(true);
            setContestKnockoutText(parseRes.Knockout_Text__c);
        } catch (err) {
            console.error(err.message);
        }

    }

    const handleContestEnd = async () => {
        try {
            //check if there are other participations active
            const response = await fetch(
                `/allendingparticipations/` + props.contest.id,
                {
                    method: "GET",
                    headers: {
                        jwt_token: localStorage.token,
                        "Content-type": "application/json"
                    }
                }
            );

            const parseRes = await response.json();
            var winningPart = parseRes[0];
            //if you have the least amount of wrong answers, set contest won
            if (winningPart !== undefined) {
                console.log('setting winners');
                for (var i = 0; i < parseRes.length; i++) {

                    console.log(parseRes[i]);
                    console.log(parseRes[i].wrong_answers__c);
                    if(parseRes[i].wrong_answers__c === parseRes[i].wrong_answers_allowed__c && parseRes[i].sfid === props.partsfid){
                        handleKnockout();
                    }
                    parseRes[i].PlaceFinish__c = i + 1;
        

                }
                console.log(JSON.stringify(parseRes));
                console.log(parseRes[0]);
                if (props.partsfid === parseRes[0].sfid) {
                    console.log('handling contest won');
                    handleContestWon()
                }else{
                    //set place finish
                    setShowContestFinished(true);
                    setContestFinishedText('Thanks for playing, you got 2nd place')
                }
            }

        } catch (err) {
            console.log('err on contest end' + err.message);
        }
    }

    const handleContestWon = async () => {
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
            setContestWonText("Congratulations, You Won");

        } catch (err) {
            console.error(err.message);
        }

    }

    const setTimer = () => {
        console.log('setting timer in setTimer');
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
            console.log('selectedCount' + selectedCount);
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
                    } else {
                        console.log('add');
                        answerList.push(childData);
                        break;
                    }
                }
            }
            setAnswerList(answerList);
            console.log(subSegmentCount);
            console.log(selectedCount + 1);
            if(selectedCount + 1 === subSegmentCount){
                setAnswerListShow(true);
            }
            setSelectedCount(selectedCount + 1);

        } catch (err) {
            console.log('err' + err.message);
        }
    }

    const handleSubsegmentCount = async (subseg) => {
        console.log('subseg' + subseg);
        console.log(questions.length);
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
        console.log('warning, close to time up');
        $('.timerdiv').addClass('warning');
    }

    useEffect(() => {
        console.log('questions use effect');
        getQuestions();
        getAllQuestions();
        if(newQuestion !== props.newQuestion) {
            console.log('in set new question');
            setNewQuestion(props.newQuestion)
            addNewQuestion(props.newQuestion)
        }
        if(newCorrectQuestion !== props.newCorrectQuestion) {
            setNewQuestion(props.newCorrectQuestion)
            addCorrectQuestion(props.newCorrectQuestion)
        }
    }, [props.newQuestion, props.newCorrectQuestion]);
    const addNewQuestion = question => {
        var questionidsIndex = questionids.indexOf(question.sfid);
        if (questionidsIndex === -1) {
            if (questions.length > 0 && questions.length === allquestions.length) {
            } else {
                var newquestions = questions;

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

                doGetParticipationWrongAnswers();
                setTimer();
                
                
                console.log('question num' + subsegplusone);
                console.log('in set logic add new questions');
                $('.timerdiv').removeClass('hiddenTimer');
                resetLogic();
            }

        } else {
            if(question.islocked__c){
                console.log('question is locked, dont do anything');
            }else{
                console.log('question not locked');
                console.log(question.islocked__c);
                const tempQuestions = questions;
                console.log('temp questions');
                tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;
                setQuestions(tempQuestions);
                setIndex(subsegplusone);
                doGetParticipationWrongAnswers();
                setTimer();
                console.log('question num' + subsegplusone);
            }

        }

    }
    const addCorrectQuestion = question => {
        console.log('in cor question');

        var tempQuestions = questions;
        tempQuestions[tempQuestions.map(r => r.sfid).indexOf(question.sfid)] = question;

        console.log('tempQuestions' + JSON.stringify(tempQuestions));
        setQuestions(tempQuestions);
        doGetParticipationWrongAnswers();
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
