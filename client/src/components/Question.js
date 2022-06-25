import React, {useEffect, useState} from 'react';
import {Col, Row, Button, Image, Modal} from "react-bootstrap";
import {v4 as uuidv4} from 'uuid';
import "./Question.css";
import info from '../assets/infoicon.png';
//import {SocketContext} from "../socket";

import correctLogo from '../assets/correctIcon.png';
import incorrectLogo from '../assets/incorrectIcon.png';
import $ from 'jquery';

const Question = (props) => {
    const [partAnswer, setPartAnswer] = useState([]);
    const [quest, setQuest] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [disabledQuestion, setDisabledQuestion] = useState(false);
    const [partanswersupdated, setUpdated] = useState(false);

    const [allpartanswers, setAllpartanswers] = useState([]);
   
    //const socket = React.useContext(SocketContext);

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

    const handleThisPartAnswer = async () => {
        console.log('handle this');
        try {
            const partsfid = props.partsfid;
            const questid = props.ques.sfid;

            if(partsfid != undefined){

            const response = await fetch(
                `/existingpartanswer/` + partsfid + `/question/` + questid,
                {
                    method: "GET",
                    headers: {jwt_token: localStorage.token}
                }
                );
                
                const parseRes = await response.json();
                setPartAnswer(parseRes);
                
                if(parseRes.validated__c ) {
                    updateAllPartAnswers();
                    console.log('validated question, will update');
                    console.log('parse res' + JSON.stringify(parseRes));
                }
                
                if (parseRes.status__c === 'Submitted') {
                    setDisabledQuestion(true);
                }
            }
        } catch (err) {
            console.error(err.message);
        }

    }

    const updateAllPartAnswers = async () => {
        console.log('handle all');
        try{
            console.log('updating parts answers');
            const partsfid = props.partsfid;
            const body = {partsfid};
            const res = await fetch(`/existingpartanswernoquestion`, {
                method: "POST",
                headers: {
                    jwt_token: localStorage.token,
                    "Content-type": "application/json"
                },
                body: JSON.stringify(body)
            });
            
            const parseData = await res.json();
            setAllpartanswers(parseData);
        
            
            
        }catch(error){
            console.log( 'err' + error.message);
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
        console.log('use effect correct answer');
        console.log('value' + props.ques.correct_answer__c);
        handleThisPartAnswer()
    },[props.ques.correct_answer__c]);

    useEffect(() => {
        setQuest(props.ques);
        handleSubsegmentCount(props.ques.subsegment__c);
        setUpdated(false);
        if (props.ques.islocked__c === true || props.isInactive === true) {
            setDisabledQuestion(true);
            handleThisPartAnswer();
        }
        updateAllPartAnswers();

    }, [props.ques,props.showAnswers]);


    return (
        <>
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
                        - Pick an answer for each question.
                    </span> <br/>
                    <span>
                        - Click ‘Submit Answers’ before countdown timer reaches zero
                    </span><br/>
                    <span>
                        - Your picks are graded in real-time when the correct answer becomes known in the live event
                    </span><br/>
                    <span>
                        - If or when you reach the limit for wrong answers - the Knockout Limit - you’re removed from the contest
                    </span><br/>
                    <span>
                        - Click Participants to keep track of how your competitors are doing
                    </span><br/>
                    <span>
                        - Click Twitter for contest updates
                    </span><br/>
                    <span>
                        - Visit our website for details on scoring &amp; prizes (https://www.pick.fun/rules)
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
            <div className="questionTextDiv aptifer">
                <h4>{props.questionNum}) {quest.question_text__c}</h4>
            </div>
        </Row>
        <Row>
            <Col>
                <div className="counterDiv font16 aptifer">
                    Question: {props.questionNum} of {props.totalQuestions}
                </div>
            </Col>
        </Row>
        <Row>
            <Col sm={1}> 
            </Col>
            <Col sm={10}>
                <div className={`btn-group m-2 ${disabledQuestion === true ? "disabledBtnGroup" : ""}`} role="group"
                    aria-label="Basic example" data-toggle="buttons">
                    <button type="radio" value="A" className={`btn btn-primary questionButton font20 fontBold proxima ${partAnswer.selection_value__c === quest.answer_a__c && disabledQuestion ? "selectedQuestion" : ""}`}
                            onClick={handleRadioChange}>{quest.answer_a__c}</button>
                    <button type="radio" value="B" className={`btn btn-primary questionButton font20 fontBold proxima ${partAnswer.selection_value__c === quest.answer_b__c && disabledQuestion ? "selectedQuestion" : ""}`}
                            onClick={handleRadioChange}>{quest.answer_b__c}</button>
                    {quest.answer_c__c !== null &&
                    <button type="radio" value="C" className={`btn btn-primary questionButton font20 fontBold proxima ${partAnswer.selection_value__c === quest.answer_c__c && disabledQuestion ? "selectedQuestion" : ""}`}
                    onClick={handleRadioChange}>{quest.answer_c__c}</button>
                }
                    {quest.answer_d__c !== null &&
                    <button type="radio" value="D" className={`btn btn-primary questionButton font20 fontBold proxima ${partAnswer.selection_value__c === quest.answer_d__c && disabledQuestion ? "selectedQuestion" : ""}`}
                    onClick={handleRadioChange}>{quest.answer_d__c}</button>
                }
                </div>
            </Col>
            <Col sm={1}> 
            </Col>
        </Row>
        
        {disabledQuestion ?
            <div>
                <Row className="mt-2">   

                    <Col>
                        <div class="font14">
                            {partAnswer.selection_value__c !== null &&
                            <span class="proxima" >My Pick: {partAnswer.selection_value__c}</span>
                            }
                            {partAnswer.selection_value__c === null &&
                            <span class="proxima">My Pick: Did Not Answer </span>
                            }
                        </div>
                    </Col>

                    {/* look here for more info */}
                    {props.ques.correct_answer__c !== null &&
                    <Col>
                        <div className='answerBanner font14'>
                            {partAnswer.selection__c == props.ques.correct_answer__c && 
                                <img alt="correct answer" width="20" src={correctLogo}/>
                            }

                            {partAnswer.selection__c != props.ques.correct_answer__c && 
                                <img alt="incorrect answer" width="20" src={incorrectLogo}/>
                            }
                            <span class="proxima" >Answer: {props.ques.correct_answer_value__c}</span>
                        </div>
                    </Col>
                    }

                    {props.ques.correct_answer__c === null &&
                        <Col>
                        <div class="font14">
                            <span class="proxima">Answer: Stay Tuned</span>
                        </div>
                    </Col>
                    }
                </Row>

                
            </div> : null
        }

        {allpartanswers.length > 0 && 
            <div className="answerMain">
            {allpartanswers.map(answer => {
                return <div className={`answerDiv  ${answer.question__c === props.ques.sfid ? ' selected ' : ''}  ${answer.correct__c === true ? 'correct' : ''} ${answer.incorrect__c === true ? 'incorrect' : ''}`}>
                </div>
            })}
            </div>
        }              
        {/* end div wrapper */}
        </>
    ) 
}

export default Question;
