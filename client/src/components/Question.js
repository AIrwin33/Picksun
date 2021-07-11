import React, {useEffect, useState} from 'react';
import {Col, Row, Button, Modal} from "react-bootstrap";

import {v4 as uuidv4} from 'uuid';
import "./Question.css";
import $ from 'jquery';

const Question = (props) => {
    const [partAnswer, setPartAnswer] = useState([]);
    const [quest, setQuest] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [showanswer, setShowAnswer] = useState([false]);
    const [showKnockOut, setKnockOut] = useState(false);
    const [contestKnockoutText, setContestKnockoutText] = useState([]);
    const [showContestWon, setShowContestWon] = useState(false);
    const [contestWonText, setContestWonText] = useState([]);
    const [disabledQuestion, setDisabledQuestion] = useState(false);


    const handleRadioChange = async (event) => {
        var tgt = $(event.target);
        var children = $(event.target).parent().children();

        console.log(tgt);
        console.log(children);

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
        console.log(label);
        console.log(tgt);
        console.log(children);

        handleUpdateQuestionValue(event.target.value, label);
    }
    const handleUpdateQuestionValue = async (eventVal, eventLabel) => {

        //insert participation answer
        try {
            let newuuid = uuidv4();
            console.log('event val' + eventVal);
            const partid = props.partsfid;
            const expartid = props.participation_id;
            console.log('is blank? ' + props.partsfid);
            const question_sfid = props.ques.sfid;
            const answer = {
                participation__c: partid,
                question__c: question_sfid,
                selection__c: eventVal,
                selection_value__c: eventLabel,
                externalid__c: newuuid,
                status__c: 'Submitted'
            }
            props.addAnswer(answer);
        } catch (err) {
            console.error(err.message);
        }

    }

    const handleExistingPartAnswer = async () => {
        try {
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
            console.log(parseRes);
            setPartAnswer(parseRes);
            var partRes = parseRes


            if (partRes.status__c === 'Submitted') {
                console.log('submitted');
                setDisabledQuestion(true);
            }

            setShowAnswer(true);


            if (props.contestfinished == true) {
                console.log('contest finsihed, handle place finsihed');
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
            const partid = props.participation_id;
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

    const handleInfoShow = async () => {
        console.log('hanlding modal');
        setShowInfo(true);
    }

    const handleInfoClose = async () => {
        console.log('close');
        setShowInfo(false);
    }

    useEffect((e) => {
        console.log(props.ques.islocked__c);
        setQuest(props.ques);
        if (props.ques.islocked__c === true || props.isInactive === true) {
            setDisabledQuestion(true);
        }else{
            handleExistingPartAnswer();
        }
        

    }, [props.ques]);


    return (
        <>

            <div
                className={`questionRow m-3 justify-content-center timer p-3  ${quest.islocked__c ? "locked" : "open"}`}>
                {(props.isKnockedOut == true || showKnockOut == true) &&
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
                <div class="infoDiv">
                    <a src="#" onClick={handleInfoShow} >
                        info
                    </a>
                    <Modal show={showInfo} onHide={handleInfoClose}>
                        <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleInfoClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleInfoClose}>
                            Save Changes
                        </Button>
                        </Modal.Footer>
                    </Modal>
                </div>

                <div className="questionTextDiv">
                    <h3>{quest.question_text__c}</h3>
                    {props.ques.live_stat__c !== null &&
                    <div>
                        <span>Current Stat: {props.ques.live_stat__c}</span>
                    </div>
                    }
                </div>
                <div className={`btn-group m-3 ${disabledQuestion === true ? "disabledBtnGroup" : ""}`} role="group"
                     aria-label="Basic example" data-toggle="buttons">
                    <button type="radio" value="A" className="btn btn-primary questionButton"
                            onClick={handleRadioChange}>{quest.answer_a__c}</button>
                    <button type="radio" value="B" className="btn btn-primary questionButton"
                            onClick={handleRadioChange}>{quest.answer_b__c}</button>
                    {quest.answer_c__c !== null &&
                    <button type="radio" value="C" className="btn btn-primary questionButton"
                            onClick={handleRadioChange}>{quest.answer_c__c}</button>
                    }
                    {quest.answer_d__c !== null &&
                    <button type="radio" value="D" className="btn btn-primary questionButton"
                            onClick={handleRadioChange}>{quest.answer_d__c}</button>
                    }
                </div>
                {partAnswer.selection__c ?
                    <div>
                        <Row>

                            <Col>
                                <div>
                                    {
                                        <span>Your Answer: {partAnswer.selection_value__c}</span>
                                    }


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
                        </Row>
                    </div> : null
                }
            </div>
            {/* end div wrapper */}
        </>
    )
}

export default Question;
