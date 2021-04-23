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

import Question from './Question.js';

import moment from 'moment';

import "./Questions.css";

import Timer from 'react-compound-timer'

const Questions = (props) => {
    const [questions, setQuestions] = useState([]);
    const [partWrongAnswer, setPartWrongAnswer] = useState([]);
    const [counter, setCounter] = useState(props.questiontime);

    const [index, setIndex] = useState(0);

    const handleCarouselSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    const doGetParticipationWrongAnswers = async () => {
        try {
          const partid = props.participation_id;
          console.log('getting particiation wrong answers allwoed' + partid);
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
          setPartWrongAnswer(parseData);
        } catch (err) {
          console.error(err.message);
        }
      }

    const getQuestions = async () => {
        try {
            console.log('get questions');

            const res = await fetch(`/questions/${props.contestid}`, {
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            var questionIdArr = [];
            var nonLockedQuestionsArr = [];
            var i = 0;
            for(i=0; parseData.length > i; i++){
                questionIdArr.push(parseData[i].sfid);
                if(parseData[i].IsLocked__c !== true){
                    nonLockedQuestionsArr.push(parseData[i]);
                }
            };

            //if there are questions that aren't locked, then set the timing
            if(nonLockedQuestionsArr.length > 0){
                console.log(props.contest.opened_time__c);
                if(props.contest.opened_time__c !== null){
                    var currtime = moment();
                    var counttime = moment.duration(currtime.diff(props.contest.opened_time__c));
                    console.log(counttime)
                    setCounter(counttime);
                }else{
                    console.log(typeof props.contest.question_time__c);
                    var millival = 180 * 1000;
                    console.log(millival);
                    setCounter(millival);
                    handleUpdateOpenedTime();
                }
                
            }else{
                console.log('no available questions');
            }
            setQuestions(parseData);
            doGetParticipationWrongAnswers();
            

          } catch (err) {
            console.error('get questions error' + err.message);
          }
      };

      const handleUpdateOpenedTime = async () => {
        try {
            const now = moment();
          const body = {now};
          const res = await fetch(`/updateOpenedTime/${props.contestid}`, {
            method: "POST",
            headers: { jwt_token: localStorage.token,
              "Content-type": "application/json" 
          },
            body: JSON.stringify(body)
          });
        }catch (err) {
            console.log('disable questions err : '+ err.message);
        }
    }

      const disableQuestions = async (questionids) => {
          try {
            const body = {questionids};
            const res = await fetch(`/disableQuestions/`, {
              method: "POST",
              headers: { jwt_token: localStorage.token,
                "Content-type": "application/json" 
            },
              body: JSON.stringify(body)
            });
      
            const parseData = await res.json();
            setQuestions(parseData);

          }catch (err) {
              console.log('disable questions err : '+ err.message);
          }
      }

      useEffect(() => {
        getQuestions(props.contest.question_timer__c);
        }, [props.contest.question_timer__c]);

        return ( 
            <>

            {/* Main Body */}
            <Container>
                <Row className="questionRow m-3 p-3 justify-content-center">
                    {/* slide for questions */}

                        <Col>
                            <div key={counter}>

                                <Timer initialTime={30000}
                                direction="backward"
                                lastUnit="s"
                                checkpoints={[
                                    {
                                        time: 0,
                                        callback: () => disableQuestions(),
                                    },
                                ]}
                                >
                                    {({ start, resume, pause, stop, reset, getTimerState, getTime, setTime }) => (
                                        
                                        <React.Fragment>

                                            {/* on timer state of stopped, call the disable function and show answer*/}
                                        <div>
                                            <Timer.Seconds /> Seconds
                                        </div>              
                                        </React.Fragment>
                                    )}
                                </Timer>
                            </div>
                        </Col>
                        <Col>
                            Wrong / Allowed Wrong: {partWrongAnswer.wrong_answers__c} / {partWrongAnswer.wrong_answers_allowed__c}
                        </Col>


                    
                </Row>
                <Row>
                    <Col>
                    {questions.length > 0 &&
                    <Carousel activeIndex={index} onSelect={handleCarouselSelect}>
                        {questions.map(question => {
                            return <Carousel.Item key={question.id} className="text-center">
                                <Question ques={question} participation_id={props.participation_id} contestquestions={props.contest.number_of_questions__c} partsfid={props.partsfid}></Question>
                            </Carousel.Item>
                        })}
                    </Carousel>
                    }

                    {questions.length === 0 && 
                        <div>
                            {props.contestQuestionText}
                        </div>
                    }
                    </Col>
                </Row>
            </Container>

            </>
        )
}

export default Questions;