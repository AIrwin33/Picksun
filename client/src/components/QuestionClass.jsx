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
import { findDOMNode } from 'react-dom';
import $ from 'jquery';

class QuestionClass extends Component {
    render() {
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
            </div>
            <ToggleButtonGroup   name="radioValue" value={radioValue} className="m-3 ">
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
                      
    
                      {partAnswer.selection__c === null &&
                      <span>Your Answer: Did Not Answer {partAnswer.selection__c}</span>
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
}