import React, {useEffect, useState} from 'react';
import {Button, Col, Row} from "react-bootstrap";
import Carousel from 'react-bootstrap/Carousel';

import "./Admin.css";

import Question from './Question'
import Answers from './Answers'


const Admin = (props) => {
    const [contests, setContests] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0)
    const [questionids, setQuestionIds] = useState([])
    const [inactive, setInactive] = useState(false)
    const [showAnswer, setShowAnswer] = useState(true)
    const [questionNum, setQuestionNum] = useState(1)
     const getAllContests = async () => {
         try {
             const res = await fetch("/allcontests", {
               method: "GET",
               headers: { jwt_token: localStorage.token }
             });
       
             const parseData = await res.json();
             console.log(parseData);
             setContests(parseData);
           } catch (err) {
             console.error(err.message);
           }
       };
    const publishContest = async (contest_id) => {
        
        try {
            console.log(contest_id);
            const body = {contest_id};
            const res = await fetch(`/publishcontest`, {
                method: 'POST',
                headers: {
                  jwt_token: localStorage.token,
                  'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
            console.log('published');
            const parseData = await res.json();
            handleGetQuestions(contest_id);
            console.log(parseData);
          } catch (err) {
            console.error(err.message);
          }

    }

    const handleGetQuestions = async (contest_idtwo) => {
        try {
            console.log(contest_idtwo);
            const res = await fetch(`/questions/` + contest_idtwo, {
              method: 'GET',
              headers: { jwt_token: localStorage.token }
            })
      
            const parseData = await res.json()
            setQuestions(parseData)
          } catch (err) {
            console.error('get questions error' + err.message)
          }
    }

    

    const handleSelect = (selectedIndex, e) => {
        console.log(selectedIndex);
        setIndex(selectedIndex)
        setQuestionNum(selectedIndex + 1)
      }
    useEffect(() => {
        console.log('getting all contests in admin');
        getAllContests();
        }, []);

    return (
        <>

            {contests.map(contest => (
                <Col xs={12} md={4}>
                    <div key={contest.id} className="LobbyCard mx-auto">
                        {contest.image_url__c !== undefined &&
                        <div>
                            <img width="247" src={contest.image_url__c}/>
                        </div>
                        }
                        <p className="whiteText aptifer font16 text-center mt-1 mb-0">{contest.name}</p>
                        <p className="whiteText aptifer font12 text-center mt-1 mb-0">{contest.start_time_text__c}</p>
                        <Button className="btnRed aptifer font16 boldText" onClick={() => publishContest(contest.sfid)}>Publish</Button>
                    </div>
                </Col>
            ))}
            
      
      {/* show questions or no question text */}

        <Row className="questionRow m-2 p-2 justify-content-center">
          <Col sm={12} lg={12}>
            {questions.length > 0 && 
              <Carousel fade className="carouselDiv" defaultActiveIndex={0} activeIndex={index} onSelect={handleSelect} interval={null}>
                {questions.map(question => {
                  return <Carousel.Item key={question.id} className="text-center">
                    <Question ques={question}
                      questionNum={questionNum}
                      isInactive={inactive}
                      totalQuestions={8}
                      showAnswers={showAnswer}
                      isAdmin={true} />
                  </Carousel.Item>
                })}
              </Carousel>
            }

          </Col>
        </Row>
        </>
    )
}

export default Admin;