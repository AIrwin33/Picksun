import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Image, Modal, Row, Tab, Tabs } from "react-bootstrap";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
//import SocketContext from "../SocketContext";
import {connect} from "react-redux";
import { useParams } from 'react-router-dom';

import io from 'socket.io-client';

const env = process.env.NODE_ENV || 'development';
const socketUrl = env === 'development' ? 'http://localhost:5432' : 'https://play.pick.fun';

const socketio = io(socketUrl, {
    rejectUnauthorized: false
});

import info from '../assets/infoicon.png';

import "./Contest.css";

import Questions from './Questions';

import avatar from '../assets/blue_avatar_200.png';



const Contest = () => {
    const {id} = useParams();
    const [contest, setContest] = useState([]);
    const [isloaded, setLoaded] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [home, setHomeTeam] = useState([]);
    const [away, setAwayTeam] = useState([]);
    const [sport, setSport] = useState('baseball');
    const [key, setKey] = useState('Questions');
    const [participation, setParticipation] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [allParts, setAllParts] = useState();
    const [allPartsList, setAllPartsList] = useState([]);
    const [activeParts, setActiveParts] = useState([]);
    const [newQuestion, setNewQuestion] = useState();
    const [newCorrectQuestion, setNewCorrectQuestion] = useState();
    
    const getContest = async () => {
        try {
            console.log(id);
            const res = await fetch(`/contestdetail/${id}`, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });
            const parseData = await res.json();
            setContest(parseData);
            getEvent(parseData);
            getContestParticipations(parseData);
        } catch (err) {
            console.error(err.message);
        }
    };

    const getEvent = async (contestRec) => {
        try {
            console.log(contestRec.event__c);
            const res = await fetch(`/event/` + contestRec.event__c, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setSport(parseData[0].sport__c);
            setHomeTeam(parseData[0]);
            setAwayTeam(parseData[1]);
            getContestParticipations();
            setTimeout(
                function() {
                    setLoaded(true);
                },
                1000
            );

        } catch (error) {
            console.error(error.message);
        }
    }

    const getContestParticipations = async () => {
        try {
            console.log('contest' + contest);
            const res = await fetch(`/contestparticipations/` + contest.sfid, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setAllParts(parseData.length);
            var i;
            var activeParts = [];
            var endParts = [];
            for (i = 0; i < parseData.length; i++) {
                if (parseData[i].status__c === 'Active') {
                    activeParts.push(parseData[i]);
                }
            }
            if(contest.status__c === 'Finished'){
                for (i = 0; i < parseData.length; i++) {
                    if (parseData[i].status__c !== 'Active') {
                        endParts.push(parseData[i]);
                    }
                }
            }
            endParts.sort((a, b) => (a.PlaceFinish__c < b.PlaceFinish__c) ? 1 : -1)

            setActiveParts(activeParts.length);
            setAllPartsList(endParts);
            setParticipations(activeParts);
            getParticipationByContest();

        } catch (err) {
            console.error(err.message);
        }
    }

    const getParticipationByContest = async () => {
        try {
            console.log('ready'+ contest.sfid);
            const res = await fetch(`/participationbycontest/` + contest.sfid, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setParticipation(parseData);
            
        } catch (err) {
            console.error(err.message);
        }
    }

    const handleInfoShow = async () => {
        setShowInfo(true);
    }

    const handleInfoClose = async () => {
        setShowInfo(false);
    }

    const tabset = useCallback(() => {
        setKey('Participants');
    })

    const updateparts = useCallback(() => {
        console.log('update parts in contest');
        console.log(contest.status__c);
        getContestParticipations(contest);
        
    })

    const socketUpdates = async () => {
        console.log('is socket connected' + socketio.connected);

        socketio.on("connect", function(data) {
            console.log('check connect');
            console.log(socketio.connected);
        });

        socketio.on("new_question", question => {
            console.log('check new question');
            setNewQuestion(question);
        })
        socketio.on("cor_question", question => {
            console.log('check cor question');
            setNewCorrectQuestion(question);
        })
        socketio.on("new_contest", contest => {
            setContest(contest);
        });

        socketio.on('disconnect', () =>{
            socketio.close();
        });

        socketio.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
            socketio.close();
          });
        return () => socketio.disconnect()
    }
    
    useEffect(() => {
        console.log('use effect');
        getContest();
        
        socketUpdates();
        
    },[]);

    // useEffect(() => {
    //     console.log('contest status' + contest.status__c);
        
    // }, [contest])
    
    return ((
            <>
                {/* Main Body */}
                <div id="contestContainer">
                    <Row className="headerRow">
                        <Col xs={1} sm={1}>
                        </Col>
                        <Col xs={10} sm={10}>
                            <div className="scoreboard">
                                <Row>
                                    <Col sm={5}>
                                        <h5 className="text-center mt-1 aptifer">{home.name}</h5>
                                    </Col>
                                    <Col sm={2}>
                                        <h5 className="text-center mt-1 aptifer">vs.</h5>
                                    </Col>
                                    <Col sm={5}>
                                        <h5 className="text-center mt-1 aptifer">{away.name}</h5>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                        <Col xs={1} sm={1}>
                        </Col>
                    </Row>
                    <Row className="rowBar">
                        <Col xs={1} sm={3}></Col>
                        <Col xs={10} sm={6} className="text-center ">
                            <h4 className="whiteText fontBold aptifer">{contest.sub_title__c}</h4>
                        </Col>
                        <Col xs={1} sm={3}>
                        </Col>
                    </Row>
                    <Tabs activeKey={key} onSelect={(k) => setKey(k)} fill className="ml-2 mr-2">
                        <Tab eventKey="Questions" title="Questions" className="aptifer pb-4 pt-4 tabwidth">
                            <Row>
                                <Col lg={3} sm={1}>

                                </Col>
                                <Col lg={6} sm={10}>
                                    {isloaded &&
                                    <Questions tabset={tabset} updatepart={updateparts} sport={sport} contestid={contest.sfid} 
                                               contestQuestionText={contest.no_questions_text__c} contest={contest}
                                               participation_id={participation.externalid__c}
                                               partsfid={participation.sfid} newQuestion={newQuestion} newCorrectQuestion={newCorrectQuestion}
                                               />
                                    }
                                </Col>
                                <Col lg={3} sm={1}>

                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="Participants" title="Participants" className="pb-4 pt-4 aptifer tabwidth">

                            {/* loop through participations */}

                            <Row className="partCard">
                                <Col lg={3} sm={1}>

                                </Col>
                                <Col lg={6} sm={10} >
                                    <Row className="colCard "> 
                                        <Col xs={1} lg={1} className="nopadding">
                                        
                                        </Col>
                                        <Col xs={9} lg={10} className="nopadding">
                                            <div className="text-center">
                                                <span class="aptifer">Participants Remaining: {activeParts}/{allParts}</span>
                                            </div>
                                        </Col>
                                        <Col xs={1} lg={1} className="nopadding">
                                        <div className="infoDiv mb-4 justify-content-end">
                                            <a src="#" className="" onClick={handleInfoShow} >
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
                                        </Col>
                                    </Row>
                                    {contest.status__c === 'Finished' &&
                                        <div>
                                            {allPartsList.map(part => {
                                            return <Row key={part.id} className="colCard ">
                                                <Col xs={2} className="text-center"> <Image src={avatar} roundedCircle
                                                                                        height="50"></Image> </Col>
                                                <Col xs={10}>
                                                    <Row>
                                                        <span className="fontBold proxima">{part.participant_name__c}</span>
                                                        {part.sfid === participation.sfid &&
                                                        <div className="yourpart ml-3 proxima">
                                                            You
                                                        </div>
                                                        }
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12} lg={12} class="proxima">
                                                            Rank: {part.placefinish__c}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        })}
                                        </div>
                                        
                                    }
                                    {contest.status__c !== 'Finished' &&
                                        <div>
                                        {participations.map(part => {
                                            return <Row key={part.id} className="colCard ">

                                                <Col xs={2} className="text-center"> <Image src={avatar} roundedCircle
                                                                                        height="50"></Image> </Col>
                                                <Col xs={10}>
                                                    <Row>
                                                        <span className="fontBold proxima">{part.participant_name__c}</span>
                                                        {part.sfid === participation.sfid &&
                                                        <div className="yourpart ml-3 proxima">
                                                            You
                                                        </div>
                                                        }
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12} lg={6} class="proxima">
                                                            Wrong Answers: {part.wrong_answers__c}
                                                        </Col>
                                                        <Col sm={12} lg={6} class="proxima">
                                                            Wrong Answers Allowed: {part.wrong_answers_allowed__c}
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            })}
                                        </div>
                                    }
                                </Col>
                                <Col lg={3} sm={1}>

                                </Col>
                            </Row>
                            
                            </Tab>
                        <Tab eventKey="Chat" title="Twitter" className="aptifer pb-4 pt-4 tabwidth">
                            <Row>
                                <Col lg={3} sm={1}>

                                </Col>
                                <Col lg={6} sm={10} className=''>
                                    <TwitterTimelineEmbed
                                        sourceType="profile"
                                        screenName="pickfungames"
                                        options={{height: 400}}
                                    />
                                </Col>
                                <Col lg={3} sm={1}>
                                    
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </div>

            </>
        )
    )
}

export default connect()(Contest);
