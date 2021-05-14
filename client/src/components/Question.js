import React, {useState,useEffect} from 'react';
import {
    Row,
    Col,
} from "react-bootstrap";

import "./Question.css";
import $ from 'jquery';

const Question = (props) => {
    const [partAnswer, setPartAnswer] = useState([]);
    const [quest, setQuest] = useState([]);
    const [showanswer, setShowAnswer] = useState([false]);
    const [showKnockOut, setKnockOut] = useState(false);
    const [contestKnockoutText, setContestKnockoutText] = useState([]);
    const [showContestWon, setShowContestWon] = useState(false);
    const [contestWonText, setContestWonText] = useState([]);
    const [disabledQuestion, setDisabledQuestion] = useState(false);
    

    const handleRadioChange = async (event) => {
      var parent = $(event.target).parent();
      //REFACTOR check if this works or I should wait
      //$(parent).addClass('disabledBtnGroup');
        //setRadioValue(event.target.value);    
        
        
        console.log(quest.sfid);
        console.log(event.target.value)
        props.addAnswer(quest.sfid, event.target.value);

        var label = '';
        if(event.target.value == 'A'){
          label = quest.answer_a__c;
        }
        if(event.target.value == 'B'){
          label = quest.answer_b__c;
        }
        if(event.target.value == 'C'){
          label = quest.answer_c__c;
        }
        if(event.target.value == 'D'){
          label = quest.answer_d__c;
        }
        console.log(label)
        //handleUpdateQuestionValue(event.target.value, label);
    }
    const handleUpdateQuestionValue = async (eventVal, eventLabel) => {
        
      //insert participation answer
      try {
        console.log('event val' + eventVal);
        const partid = props.partsfid;
        const expartid = props.participation_id;
        const question_sfid = props.ques.sfid;
        const body = {partid, question_sfid, eventVal, eventLabel, expartid};
        const response = await fetch(
          "/answers",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );
        
        const parseRes = await response.json();
        setPartAnswer(parseRes);
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
        `/existingpartanswer/` + partsfid + `/question/`+ questid,
        {
          method: "GET",
          headers: { jwt_token: localStorage.token}
        }
      );
      
      const parseRes = await response.json();
      console.log(JSON.stringify(parseRes));
      setPartAnswer(parseRes);
      var partRes = parseRes

      
      if(partRes.status__c === 'Submitted'){
        console.log('submitted');
        setDisabledQuestion(true);
      }

      setShowAnswer(true);  

      

      if(props.contestfinished == true){
        console.log('contest finsihed, handle place finsihed');
        //TODO - wait for correct count
        handleContestEnd();
      }else{
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
          headers: { jwt_token: localStorage.token,
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );
      
      const parseRes = await response.json();
        const participationwrong = parseRes;
        if(participationwrong.wrong_answers_allowed__c === participationwrong.wrong_answers__c){
          handleKnockout();
        }else {
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
            headers: { jwt_token: localStorage.token,
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
    try{
      console.log('quest contest' + quest.contest__c);
      //check if there are other participations active
      const response = await fetch(
        `/allendingparticipations/` + quest.contest__c,
        {
          method: "GET",
            headers: { jwt_token: localStorage.token,
              "Content-type": "application/json"
          }
        }
      );

      const parseRes = await response.json();
      var winningPart = parseRes[0];
      //if you have the least amount of wrong answers, set contest won
      if(winningPart !== undefined){
        for(var i=0;i< parseRes.length; i++ ){
          console.log(parseRes[i]);
          console.log(parseRes[i].wrong_answers__c);
        }
  
        if(props.partsfid === parseRes[0].sfid){
          console.log('handling contest won');
          handleContestWon()
        }
      }

    }catch(err) {
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
          headers: { jwt_token: localStorage.token,
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

  useEffect(() => {
    setQuest(props.ques);
    if(props.ques.islocked__c === true || props.isInactive === true){
      setDisabledQuestion(true);
    }
    handleExistingPartAnswer();

  }, [props.ques]);


    return (
        <>

        <div className={`questionRow m-3 justify-content-center timer p-3  ${quest.islocked__c ? "locked" : "open" }`}> 
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
          
        <div className="questionTextDiv">
            <h3>{quest.question_text__c}</h3>
            <div>
              <span>Current Stat: {props.ques.live_stat__c}</span>
            </div>
        </div>

        <div className={`btn-group m-3 ${disabledQuestion === true ? "disabledBtnGroup" : "" }`} role="group" aria-label="Basic example"  data-toggle="buttons">
          <button type="radio" value="A" className="btn btn-primary questionButton" onClick={handleRadioChange}>{quest.answer_a__c}</button>
          <button type="radio" value="B" className="btn btn-primary questionButton" onClick={handleRadioChange}>{quest.answer_b__c}</button>
          {quest.answer_c__c !== null &&
            <button type="radio" value="C" className="btn btn-primary questionButton" onClick={handleRadioChange}>{quest.answer_c__c}</button>
          }
          {quest.answer_d__c !== null &&
            <button type="radio" value="D" className="btn btn-primary questionButton" onClick={handleRadioChange}>{quest.answer_d__c}</button>
          }
        </div>
        {showanswer == true &&
        <div>
            <Row>
              
              <Col>
                <div>  
                  {partAnswer.selection__c !== null &&
                  <span>Your Answer: {partAnswer.selection_value__c}</span>
                  }
                  

                  {partAnswer.selection__c === null &&
                  <span>Your Answer: Did Not Answer </span>
                  }
                </div>
              </Col>
              {/* {partAnswer.selection__c === props.ques.correct_answer__c &&
              <Col>
                <div>
                  <span>Correct Answer: {props.ques.correct_answer_value__c}</span>
                </div>
              </Col>
              } */}

              {props.ques.correct_answer__c !== null &&
              <Col>
                <div
                  className={`answerBanner ${partAnswer.selection__c !== props.ques.correct_answer__c ? "red" : "green" }`}
                  >
                    {partAnswer.selection__c !== props.ques.correct_answer__c}
                  <span>Correct Answer: {props.ques.correct_answer_value__c}</span>
                </div>
              </Col>
              }
            </Row>
        </div>
        }
        </div>
        {/* end div wrapper */}
        </>
    )
}

export default Question;