import React, {useEffect, useState} from 'react';
import {Button, Col, Row} from "react-bootstrap";

import "./Admin.css";


const Admin = (props) => {
    const [contests, setContests] = useState([]);
    const [questions, setQuestions] = useState([])
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
            console.log(parseData);
          } catch (err) {
            console.error(err.message);
          }

    }

    const handleMarkCorrect = async () => {
        console.log('mark correct')
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
              <Carousel fade className="carouselDiv" ref={carouselRef} defaultActiveIndex={0} activeIndex={index} onSelect={handleSelect} interval={null}>
                {/* {questions.map(question => {
                  return <Carousel.Item key={question.id} className="text-center">
                    <Question addAnswer={updateAnswerList}
                      knockoutcalloutchild={handleKnockoutChild}
                      ques={question}
                      contest={props.contest}
                      questionNum={questionNum}
                      totalQuestions={publishedQuestions}
                      isInactive={inactive}
                      getsubcount={handleSubsegmentCount}
                      partsfid={partWrongAnswer.sfid}
                      showAnswers={showAnswer} />
                  </Carousel.Item>
                })} */}
              </Carousel>
            }

          </Col>
        </Row>
        <Row className="questionRow m-2 p-2 justify-content-center">

            <Col xs={6} lg={4}>
                <button
                className="btn btn-primary submitButton"
                onClick={handleMarkCorrect}>Mark Correct
                        </button>
            </Col>
        </Row>
        </>
    )
}

export default Admin;