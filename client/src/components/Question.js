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

import Timer from 'react-compound-timer'


const Question = (props) => {

    const [radioValue, setRadioValue] = useState('');
    const [counter, setCounter] = useState();
    const [quest, setQuest] = useState([]);
    const [showanswer, setShowAnswer] = useState([false]);

    const handleRadioChange = async (event) => {
        console.log(event.target.value);
        setRadioValue(event.target.value);
    }

    const disableQuestion = async (questionid) => {
        try {
        const questionids = [];
        questionids.push(questionid);
        console.log(questionids);
          const body = {questionids};
          const res = await fetch(`http://localhost:5000/disableQuestions/`, {
            method: "POST",
            headers: { jwt_token: localStorage.token,
              "Content-type": "application/json" 
          },
            body: JSON.stringify(body)
          });
          console.log('here in disable questions');
          const parseData = await res.json();
          setQuest(parseData);
          setShowAnswer(true);  

        }catch (err) {
            console.log('disable questions err : '+ err.message);
        }
    }

    const handleUpdateQuestionValue = async (eventVal) => {
        
      //insert participation answer
      try {
        const partid = props.participation_id;
        const question_id = props.ques.id;
        const question_sfid = props.ques.sfid;
        const body = {partid, question_id, eventVal};
        const response = await fetch(
          "http://localhost:5000/answers",
          {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );
        
        const parseRes = await response.json();
        console.log('created parse res' + JSON.stringify(parseRes));
          console.log("answer submitted Successfully");
        disableQuestion(question_sfid);
        
        
      } catch (err) {
        console.error(err.message);
      }

  }

  useEffect(() => {
    setQuest(props.ques);

    //props.ques.publish_time__c
    var pubtime = moment(props.ques.publish_time__c);
    console.log(pubtime);

    //get current time

    var currtime = moment();

    console.log(currtime);
    //moment current time

    var cutofftime = moment(props.ques.publish_time__c).add(120,'seconds');

    if(moment(currtime).isBefore(cutofftime)){
        //get time between current time and cutofftime

        var counttime = moment.duration(currtime.diff(cutofftime));

        setCounter(counttime);
    }else{
        
      console.log('else disable?');
      //disableQuestion(props.ques.sfid)
    }


  }, [props.ques]);


    return (
        <>

        <div className="questionRow m-3 justify-content-center timer p-3">
            <Timer initialTime={counter}
            direction="backward"
            lastUnit="s">
                {({ start, resume, pause, stop, reset, getTimerState, getTime }) => (
                    <React.Fragment>

                        {/* on timer state of stopped, call the disable function and show answer*/}
                    <div>
                        <Timer.Seconds /> Seconds
                    </div>              
                    </React.Fragment>
                )}
            </Timer>
        </div>
        <div className="questionTextDiv">
            <h3>{quest.question_text__c}</h3>
        </div>
        <ToggleButtonGroup   name="radioValue" value={radioValue} className="mb-2" onChange={(e) => handleUpdateQuestionValue(e)}>
            <ToggleButton
                disabled={quest.IsLocked__c}
                className="questionButton"
                value="A"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_a__c}</ToggleButton>
            <ToggleButton
                disabled={quest.IsLocked__c}
                className="questionButton"
                value="B"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_b__c}</ToggleButton>
            <ToggleButton
                disabled={quest.IsLocked__c}
                className="questionButton"
                value="C"
                type="radio"
                onClick={(e) => handleRadioChange(e)}
                >{quest.answer_c__c}</ToggleButton>
            <ToggleButton
                disabled={quest.IsLocked__c}    
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
            <span>Correct Answer: {props.ques.correct_answer__c}</span>
        </div>
        }
        </>
    )
}

export default Question;