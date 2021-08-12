import React, {useEffect, useState} from 'react';
import {Col, Row, Button, Image, Modal} from "react-bootstrap";

import {v4 as uuidv4} from 'uuid';
import "./Question.css";
import info from '../assets/infoicon.png';
import $ from 'jquery';

const Question = (props) => {
    const [partAnswer, setPartAnswer] = useState([]);
    const [quest, setQuest] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [showanswer, setShowAnswer] = useState(false);
    const [subSegmentCount, setSubsegmentCount] = useState(0);
    const [showKnockOut, setKnockOut] = useState(false);
    const [contestKnockoutText, setContestKnockoutText] = useState([]);
    const [showContestWon, setShowContestWon] = useState(false);
    const [contestWonText, setContestWonText] = useState([]);
    const [disabledQuestion, setDisabledQuestion] = useState(false);


    const handleRadioChange = async (event) => {
        var tgt = $(event.target);
        var children = $(event.target).parent().children();

        $(children).removeClass('sel');
        $(tgt).addClass('sel');

        var label = '';
        if (event.target.value == 'A') {
            label = quest.answer_a__c;
        }
        if (event.target.value == 'B') {
            label = quest.answer_b__c;
        }
        if (event.target.value == 'C') {
            label = quest.answer_c__c;
        }
        if (event.target.value == 'D') {
            label = quest.answer_d__c;
        }
        
        handleUpdateQuestionValue(event.target.value, label);
    }
    const handleUpdateQuestionValue = async (eventVal, eventLabel) => {
        try {
            let newuuid = uuidv4();
            const partid = props.partsfid;
            const question_sfid = props.ques.sfid;
            console.log(question_sfid);
            const answer = {
                participation__c: partid,
                question__c: question_sfid,
                selection__c: eventVal,
                selection_value__c: eventLabel,
                externalid__c: newuuid,
                status__c: 'Submitted'
            }

            //add answer to client side answer list in Questions JS before submitting
            props.addAnswer(answer);
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleExistingPartAnswer = async () => {
        try {
            console.log('handle existing answer');
            const partsfid = props.partsfid;
            const questid = props.ques.sfid;

            const response = await fetch(
                `/existingpartanswer/` + partsfid + `/question/` + questid,
                {
                    method: "GET",
                    headers: {jwt_token: localStorage.token}
                }
            );

            const parseRes = await response.json();
            setPartAnswer(parseRes);
            var partRes = parseRes


            if (partRes.status__c === 'Submitted') {
                console.log('submitted');
                setDisabledQuestion(true);
            }

            setShowAnswer(true);
            if (props.contestfinished == true) {
                //TODO - wait for correct count
                handleContestEnd();
            } else {
                getParticipationWrongAnswerInfo()
            }
        } catch (err) {
            console.error(err.message);
        }

    }


    const getParticipationWrongAnswerInfo = async () => {

        //insert participation answer
        try {
            const partid = props.participation_id;
            const body = {partid};
            const response = await fetch(
                "/wronganswer",
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
            const participationwrong = parseRes;
            if (participationwrong.wrong_answers_allowed__c === participationwrong.wrong_answers__c) {
                console.log(participationwrong.wrong_answers_allowed__c);
                console.log(participationwrong.wrong_answers__c);
                handleKnockout();
            } else {
                console.log('still in the game');
            }
        } catch (err) {
            console.error(err.message);
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
            console.log('quest contest' + quest.contest__c);
            //check if there are other participations active
            const response = await fetch(
                `/allendingparticipations/` + quest.contest__c,
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
                for (var i = 0; i < parseRes.length; i++) {
                    console.log(parseRes[i]);
                    console.log(parseRes[i].wrong_answers__c);
                }

                if (props.partsfid === parseRes[0].sfid) {
                    console.log('handling contest won');
                    handleContestWon()
                }
            }

        } catch (err) {
            console.log('err on contest end' + err.message);
        }
    }

    const handleContestWon = async () => {
        try {
            const contestid = props.ques.contest__c;
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

    
    const handleSubsegmentCount = async (subseg) => {
        try {
            var conid = props.contest.sfid
            const body = {conid, subseg};
            const res = await fetch(`/countsubsegment`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const parseData = await res.json();
            setSubsegmentCount(parseData);
            //set subsegement. why?
            props.getsubcount(parseData);
        }
        catch (err) {
            console.log('err subsegment' + err.message);
        }
    }

    //show info modal on question
    const handleInfoShow = async () => {

        setShowInfo(true);
    }
    //close info modal on question
    const handleInfoClose = async () => {

        setShowInfo(false);
    }

    useEffect(() => {

        setQuest(props.ques);
        handleSubsegmentCount(props.ques.subsegment__c);
        if (props.ques.islocked__c === true || props.isInactive === true || props.issubmitted === true) {
            setDisabledQuestion(true);
            
            
        }
        handleExistingPartAnswer();
    }, [props.ques]);


    return (
        <>

            <div
                className={`questionRow m-3 justify-content-center timer p-3  ${quest.islocked__c ? "locked" : "open"}`}>
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
                <div className="infoDiv mb-4">
                    <a src="#" className="float-right" onClick={handleInfoShow} >
                        <Image src={info} width="22"></Image>
                    </a>
                    <Modal className="modalDiv" show={showInfo} onHide={handleInfoClose}>
                        <Modal.Header closeButton>
                        <Modal.Title className="aptifer font16 modalHeader">How To Pick Fun</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="proxima font12 modalBody">
                            <span>
                                Pick an answer for each question. You’ll know you have unanswered questions when the countdown timer and bouncing ball image are present.
                            </span> <br/>
                            <span>
                                Before the countdown timer reaches zero, click ‘Submit Answers.’ The ‘Submit Answer’ button becomes clickable once you’ve picked answers for all available questions.
                            </span><br/>
                            <span>
                                Review your answers and results using left / right toggles.
                            </span><br/>
                            <span>
                                Keep your phone nearby when playing! Questions are published live in small batches.
                            </span><br/>
                            <span>
                                Keep track of how many answers you’ve gotten wrong + how many left until you’re knocked by looking at the ‘Wrong Answers’ indicator. When all circles (Knockout Limit) are filled in, you’ll be removed from the contest.
                            </span><br/>
                            <span>
                                Click ‘Participants’ to see who else is still alive in the contest.
                            </span><br/>
                            <span>
                                Access Twitter to communicate with us before, during or after contests.
                            </span><br/>
                            <span>
                                You’ll receive a prompt if you get knocked out and notification if you’re one of the winners. We’ll follow up with winners directly.
                            </span>

                            

                        </Modal.Body>
                        <Modal.Footer>
                        <Button className="aptifer modalBtn" variant="secondary" onClick={handleInfoClose}>
                            Close
                        </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <Row>

                    <div className="questionTextDiv">
                        <h3>{props.questionNum}) {quest.question_text__c}</h3>
                        {/* {props.ques.live_stat__c !== null &&
                        <div>
                        <span>Current Stat: {props.ques.live_stat__c}</span>
                        </div>
                    } */}
                    </div>
                </Row>
                <Row>
                <Col>
                    <div className={`btn-group m-3 ${disabledQuestion === true ? "disabledBtnGroup" : ""}`} role="group"
                        aria-label="Basic example" data-toggle="buttons">
                        <button type="radio" value="A" className="btn btn-primary questionButton font20"
                                onClick={handleRadioChange}>{quest.answer_a__c}</button>
                        <button type="radio" value="B" className="btn btn-primary questionButton font20"
                                onClick={handleRadioChange}>{quest.answer_b__c}</button>
                        {quest.answer_c__c !== null &&
                        <button type="radio" value="C" className="btn btn-primary questionButton font20"
                        onClick={handleRadioChange}>{quest.answer_c__c}</button>
                    }
                        {quest.answer_d__c !== null &&
                        <button type="radio" value="D" className="btn btn-primary questionButton font20"
                        onClick={handleRadioChange}>{quest.answer_d__c}</button>
                    }
                    </div>
                    </Col>
                </Row>
                <Row className="counterDiv">
                    <Col>
                        <div className="float-right">
                            Question: {props.questionNum} of {props.totalQuestions}
                        </div>
                    </Col>
                </Row>
                
                {partAnswer.selection__c ?
                    <div>
                        <Row>

                            <Col>
                                <div>
                                    <span>Your Answer: {partAnswer.selection_value__c}</span>
                                    {partAnswer.Status__c === 'Did Not Answer' &&
                                    <span>Your Answer: Did Not Answer </span>
                                    }
                                </div>
                            </Col>
                            {props.ques.correct_answer__c !== null &&
                            <Col>
                                <div
                                    className={`answerBanner ${props.ques.selection__c !== props.ques.correct_answer__c ? "red" : "green"} ${partAnswer.selection__c !== props.ques.correct_answer__c ? "red" : "green"}`}
                                >
                                    {props.ques.selection__c !== props.ques.correct_answer__c}
                                    <span>Correct Answer: {props.ques.correct_answer_value__c} {partAnswer.correct_answer_value__c}</span>
                                </div>
                            </Col>
                            }

                            {props.ques.correct_answer__c === null &&
                             <Col>
                                <div>
                                    <span>Correct Answer: Stay Tuned</span>
                                </div>
                            </Col>
                            }
                        </Row>
                    </div> : null
                }
            </div>
            {/* end div wrapper */}
        </>
    ) 
}

export default Question;
