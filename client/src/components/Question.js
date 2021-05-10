import React, {useState,useEffect} from 'react';
import {
    Row,
    Col,
} from "react-bootstrap";

import "./Question.css";
import $ from 'jquery';






const Question = (props) => {
    //const [radioValue, setRadioValue] = useState('');
    
    
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
        
        
        // console.log(quest.sfid);
        // console.log(event.target.value)
        // props.callbackMap(quest.sfid, event.target.value);

        console.log('event label' + event.target.labels[0]);
        //handleUpdateQuestionValue(event.target.value);
    }
    const handleUpdateQuestionValue = async (eventVal) => {
        
      //insert participation answer
      try {
        console.log('event val' + eventVal);
        const partid = props.partsfid;
        console.log('external id : use isntead?' + props.participation_id);
        console.log('in set answer part Id' + partid);
        const expartid = props.participation_id;
        const question_sfid = props.ques.sfid;
        const eventLabel = 'label';
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
        console.log('created part answer' + JSON.stringify(parseRes));
        setPartAnswer(parseRes);

        if(quest.correct_answer__c !== null){
          checkAnswer(question_sfid, eventVal, quest.correct_answer__c, parseRes.sfid);
        }
        
      } catch (err) {
        console.error(err.message);
      }

  }

  const checkAnswer = async (question_sfid, answerval, correctval, partanswerid) => {
    try{
      const body = {partanswerid};
      const response = await fetch(
        "/validatepartanswer",
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
      console.log('validated part answer' + JSON.stringify(parseRes))
      console.log('correct answer' + correctval);
      console.log('answer value' + answerval);
      if(partAnswer.status__c === 'Submitted'){
        setDisabledQuestion(true);
      }
      
      if(correctval === answerval){
        console.log('answer was correct');
        handleCorrectAnswer();
      }else{
        console.log('answer was wrong');
        handleWrongAnswer();
      }
    }catch (err) {
      console.log('err' + err.message)
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
      console.log('existing part answer' + parseRes.Name);
      console.log('existing part answer' + parseRes.status__c);
      
      if(parseRes.status__c === 'Submitted'){
        setDisabledQuestion(true);
      }
      console.log(parseRes.validated__c);
      console.log(props.ques.correct_answer__c);
      if(parseRes.validated__c === false && props.ques.correct_answer__c !== null){
        console.log('checking existing answer');
        console.log(props.ques.correct_answer__c);
        console.log(questid);
        checkAnswer(questid, parseRes.selection__c, props.ques.correct_answer__c, parseRes.sfid);
      }else{
        setShowAnswer(true);  
      }
       
    } catch (err) {
      console.error(err.message);
    }

  }

  const handleCorrectAnswer = async () => {
    try {
      if(props.publishedquestionscount === props.contestquestions){
        
        handleContestEnd();
      }else{
        console.log('continue playing');
      }

    }catch(err){

    }
  }

  const handleWrongAnswer = async () => {
        
    //insert participation answer
    try {
      console.log('handle wrong answer');
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
        console.log(parseRes);
        const participationwrong = parseRes;
        props.parentCallback();
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
      console.log('starting in knockout');
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
      console.log('created parse res' + JSON.stringify(parseRes));
      console.log("You've been knocked out");
      setKnockOut(true);
      setContestKnockoutText(parseRes.Knockout_Text__c);
    } catch (err) {
      console.error(err.message);
    }

  }

  const handleContestEnd = async () => {
    try{
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
      //sort by number of answers wrong
        console.log('winning part '+ parseRes[0]);
      //loop through and set place finish
      for(var i=0;i< parseRes.length; i++ ){
        console.log(parseRes[i]);
        console.log(parseRes[i].wrong_answers__c);
      }


      //if you have the least amount of wrong answers, set contest won
      if(props.partsfid === parseRes[0].sfid){
        handleContestWon()
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
      console.log('created parse res' + JSON.stringify(parseRes));
      console.log('You won');

      //also disable questions
      setShowContestWon(true);
      setContestWonText("Congratulations, You Won");

    } catch (err) {
      console.error(err.message);
    }

  }

  useEffect(() => {
    setQuest(props.ques);
    if(props.ques.islocked__c === true){
      setDisabledQuestion(true);
    }
    handleExistingPartAnswer();
    
    // }
    //props.ques.publish_time__c
    // var pubtime = moment(props.ques.publish_time__c);
    // console.log(pubtime);

    // //get current time

    // var currtime = moment();

    // console.log(currtime);
    // //moment current time

    // var cutofftime = moment(props.ques.publish_time__c).add(120,'seconds');

    // if(moment(currtime).isBefore(cutofftime)){
    //     //get time between current time and cutofftime

    //     var counttime = moment.duration(currtime.diff(cutofftime));

    //     setCounter(counttime);
    // }else{
        
    //   console.log('else disable?');
    //   //disableQuestion(props.ques.sfid)
    // }


  }, [props.ques]);


    return (
        <>

        <div className={`questionRow m-3 justify-content-center timer p-3  ${quest.islocked__c ? "locked" : "open" }`}> 
          {(props.isKnockedOut == true || showKnockOut == true) && 
          <Row>
            <div className="centerText">
              <span>you are knocked out</span>
              <span>{props.isKnockedOut}</span>
              <span>{showKnockOut}</span>
              <span>{contestKnockoutText}</span>
            </div>
          </Row>
          }

          {(props.isContestWon == true || showContestWon == true) && 
            <Row>
              <div className="centerText">
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