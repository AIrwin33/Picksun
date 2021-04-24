import React, {Component, useState,useEffect} from 'react';
import {
    ButtonGroup,
    ToggleButton,
    Container, 
    Row,
    Col,
    Image,
    Carousel,
    Button,
    ToggleButtonGroup,
    ResponsiveEmbed
} from "react-bootstrap";

import "./Question.css";

import moment from 'moment';




const Question = (props) => {
    const [radioValue, setRadioValue] = useState('');
    
    
    const [partAnswer, setPartAnswer] = useState([]);
    const [quest, setQuest] = useState([]);
    const [showanswer, setShowAnswer] = useState([false]);
    const [showKnockOut, setKnockOut] = useState([false]);
    const [contestKnockoutText, setContestKnockoutText] = useState([]);
    const [showContestWon, setContestWon] = useState([false]);
    const [contestWonText, setContestWonText] = useState([]);

    const handleRadioChange = async (event) => {
        setRadioValue(event.target.value);
        handleUpdateQuestionValue(event.target.value);
    }

    

    const disableQuestion = async (questionid) => {
        try {
        const questionids = [];
        questionids.push(questionid);
        console.log(questionids);
          const body = {questionids};
          const res = await fetch(`/disableQuestions`, {
            method: "POST",
            headers: { jwt_token: localStorage.token,
              "Content-type": "application/json" 
          },
            body: JSON.stringify(body)
          });
          const parseData = await res.json();
          console.log('here in disable question' + JSON.stringify(parseData));
          setQuest(parseData);

          //only show answer if it exists
          if(parseData.correct_answer__c !== null){
            setShowAnswer(true);  
          }

        }catch (err) {
            console.log('disable questions err : '+ err.message);
        }
    }

    

    const handleUpdateQuestionValue = async (eventVal) => {
        
      //insert participation answer
      try {
        console.log('event val' + eventVal);
        const partid = props.partsfid;
        const question_sfid = props.ques.sfid;
        const body = {partid, question_sfid, eventVal};
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
        checkAnswer(question_sfid, eventVal, props.ques.correct_answer__c);
        disableQuestion(question_sfid); 
        
        
      } catch (err) {
        console.error(err.message);
      }

  }

  const checkAnswer = async (question_sfid, answerval, correctval) => {
    try{
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
      const body = {partsfid, questid};
      const response = await fetch(
        "/existingpartanswer",
        {
          method: "GET",
          headers: { jwt_token: localStorage.token,
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );
      
      const parseRes = await response.json();
      checkAnswer(questid, parseRes.selection__c, props.ques.correct_answer__c);
      disableQuestion(questid); 
       
    } catch (err) {
      console.error(err.message);
    }

  }

  const handleCorrectAnswer = async () => {
    try {
      if(props.publishedquestionscount === props.contestquestions){
        handleContestWon();
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
      console.log('created parse res' + JSON.stringify(parseRes));
      console.log("You've been knocked out");
      setKnockOut(true);
      setContestKnockoutText(parseRes.Knockout_Text__c);
    } catch (err) {
      console.error(err.message);
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
      setContestWon(true);
      setContestWonText("Congratulations, You Won");

    } catch (err) {
      console.error(err.message);
    }

  }

  useEffect(() => {
    setQuest(props.ques);
    console.log('is question locked' + props.ques.islocked__c);
    //show answer on reload

    if(props.ques.correct_answer__c !== null){

      //get existing answer
      handleExistingPartAnswer();

    }
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
          {showKnockOut && 
          <Row>
            <div>
              {contestKnockoutText}
            </div>
          </Row>
          }

          {showContestWon && 
            <Row>
              <div>
                {contestWonText}
              </div>
            </Row>
            }
          
        <div className="questionTextDiv">
            <h3>{quest.question_text__c}</h3>
            {props.ques.islocked__c &&
            <span>true</span>
            }
        </div>
        <ToggleButtonGroup   name="radioValue" value={radioValue} className={`m-3  ${props.ques.islocked__c ? "disabled" : "" }`}>
            <ToggleButton
                
                className="questionButton"
                value="A"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_a__c}</ToggleButton>
            <ToggleButton
                
                className="questionButton"
                value="B"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_b__c}</ToggleButton>
            <ToggleButton
                
                className="questionButton"
                value="C"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_c__c}</ToggleButton>
            <ToggleButton
                    
                className="questionButton"
                value="D"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_d__c}</ToggleButton>
        </ToggleButtonGroup>
        
        <div>
            <span>Current Stat: {props.ques.live_stat__c}</span>
        </div>

        {showanswer == true &&
        <div>
            <Row>
              
              <Col>
                <div>  
                  {partAnswer.selection__c !== null &&
                  <span>Your Answer: {partAnswer.selection__c}</span>
                  }

                  {partAnswer.selection__c == null &&
                  <span>Your Answer: Did Not Answer</span>
                  }
                </div>
              </Col>
              {partAnswer.selection__c === props.ques.correct_answer__c &&
              <Col>
                <div>
                  <span>Correct Answer: {props.ques.correct_answer__c}</span>
                </div>
              </Col>
              }

              {partAnswer.selection__c !== props.ques.correct_answer__c  && props.ques.correct_answer__c !== null &&
              <Col>
                <div
                  className={`answerBanner ${partAnswer.selection__c !== props.ques.correct_answer__c ? "red" : "green" }`}
                  >
                  <span>Correct Answer: {props.ques.correct_answer__c}</span>
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