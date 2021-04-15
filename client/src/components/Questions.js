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

import "./Questions.css";

const Questions = (props) => {
    const [questions, setQuestions] = useState([]);
    
    const [questionids, setQuestionIds] = useState([]);

    const getQuestions = async () => {
        try {
            console.log('get questions')
            const res = await fetch(`/questions/${props.contestid}`, {
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            console.log('questions' + JSON.stringify(parseData));
            var questionIdArr = [];
            var i = 0;
            for(i=0; parseData.length > i; i++){
                console.log(parseData[i].sfid);
                questionIdArr.push(parseData[i].sfid);
            };
            setQuestionIds(questionIdArr);
            setQuestions(parseData);

          } catch (err) {
            console.error('get questions error' + err.message);
          }
      };

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
        getQuestions();
        }, []);

        return (
            <>

            {/* Main Body */}
            <Container>
                <Row className="questionRow m-3 p-3 justify-content-center">
                    {/* slide for questions */}
                    <Carousel>
                        {questions.map(question => {
                            return <Carousel.Item key={question.id} className="text-center">
                                <Question ques={question} participation_id={props.participation_id}></Question>
                            </Carousel.Item>
                        })}
                    </Carousel>
                </Row>
            </Container>

            </>
        )
}

export default Questions;