import React, {useEffect, useState, useCallback} from 'react';
import {Row, Col, Tab, Tabs, Image} from "react-bootstrap";
import {TwitterTimelineEmbed} from 'react-twitter-embed';
import {SocketContext} from "../socket";
import {connect} from "react-redux";

import "./Contest.css";

import Questions from './Questions.js';

import avatar from '../assets/blue_avatar_200.png';


const Contest = ({match}) => {
    const [contest, setContest] = useState([]);
    const [isloaded, setLoaded] = useState(false);
    const [home, setHomeTeam] = useState([]);
    const [away, setAwayTeam] = useState([]);
    const [participation, setParticipation] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [allParts, setAllParts] = useState();
    const [activeParts, setActiveParts] = useState([]);
    const [newQuestion, setNewQuestion] = useState()
    const [newCorrectQuestion, setNewCorrectQuestion] = useState()
    const socket = React.useContext(SocketContext)
    const getContest = async () => {
        try {
            const res = await fetch(`/contestdetail/${match.params.id}`, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setContest(parseData);
            getEvent(parseData);

        } catch (err) {
            console.error(err.message);
        }
    };

    const getEvent = async (contestRec) => {
        try {
            const res = await fetch(`/event/` + contestRec.event__c, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setHomeTeam(parseData[0]);
            setAwayTeam(parseData[1]);
            getContestParticipations(contestRec);
            setTimeout(
                function() {
                    console.log('end of timeout');
                    
                    setLoaded(true);
                },
                2000
            );

        } catch (error) {
            console.error(error.message);
        }
    }

    const getContestParticipations = async (contestRec) => {
        try {
            const res = await fetch(`/contestparticipations/` + contestRec.sfid, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setAllParts(parseData.length);
            var i;
            var activeParts = [];
            for (i = 0; i < parseData.length; i++) {
                if (parseData[i].status__c === 'Active') {
                    activeParts.push(parseData[i]);
                }
            }
            setActiveParts(activeParts.length);
            setParticipations(activeParts);
            getParticipationByContest(contestRec);

        } catch (err) {
            console.error(err.message);
        }
    }

    const getParticipationByContest = async (contestRec) => {
        try {
            const res = await fetch(`/participationbycontest/` + contestRec.sfid, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setParticipation(parseData);
            
        } catch (err) {
            console.error(err.message);
        }
    }

    const updateparts = useCallback(() => {
        //updates participations in the contest as they are updated from questions.
        //passed up from questions js when answers are marked
        console.log('update parts');
        getContestParticipations(contest);
    })
    useEffect(() => {
        getContest().then(r =>  {
            console.log('here in contest', contest);
            console.log('r'+ r);
            socket.emit("set_contest_room", match.params.id);
            socket.on("new_question", question => {
                console.log("new question")
                setNewQuestion(question)
            })
            socket.on("cor_question", question => {
                console.log("new correct question");
                setNewCorrectQuestion(question)
            })
            socket.on("new_contest", contest => {
                console.log('new_contest' + contest);
                setContest(contest)
            })
        });
    }, [socket]);
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
                        <Col xs={3} sm={3}></Col>
                        <Col xs={6} sm={6} className="text-center ">
                            <h4 className="whiteText fontBold aptifer">{contest.name}</h4>
                        </Col>
                        <Col xs={3} sm={3}>
                        </Col>
                    </Row>
                    <Tabs fill className="ml-2 mr-2">
                        <Tab eventKey="Questions" title="Questions" className="aptifer">
                            <Row>
                                <Col lg={3} sm={1}>

                                </Col>
                                <Col lg={6} sm={10}>
                                    {isloaded &&
                                    <Questions updatepart={updateparts} contestid={contest.sfid}
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
                        <Tab eventKey="Participants" title="Participants" className="pb-4 pt-4 aptifer">

                            {/* loop through participations */}

                            <Row className="rowCard ">
                                <Col xs={3}>

                                </Col>
                                <Col xs={6} className="text-center">
                                    <span>Participants Remaining: {activeParts}/{allParts}</span>
                                </Col>
                                <Col xs={3}>

                                </Col>
                            </Row>
                            {participations.map(part => {
                                return <Row key={part.id} className="rowCard ">

                                    <Col xs={3} className="text-right"> <Image src={avatar} roundedCircle
                                                                               height="50"></Image> </Col>
                                    <Col xs={9}>
                                        <Row>
                                            <span className="fontBold">{part.participant_name__c}</span>
                                            {part.sfid === participation.sfid &&
                                            <div className="yourpart ml-3">
                                                You
                                            </div>
                                            }
                                        </Row>
                                        <Row>
                                            <Col>
                                                Wrong Answers: {part.wrong_answers__c}
                                            </Col>
                                            <Col>
                                                Wrong Answers Allowed: {part.wrong_answers_allowed__c}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            })}
                        </Tab>
                        <Tab eventKey="Chat" title="Twitter" className="aptifer ">
                            <Row>
                                <Col lg={4} sm={1}>

                                </Col>
                                <Col lg={4} sm={10} className=''>
                                    <TwitterTimelineEmbed
                                        sourceType="profile"
                                        screenName="playpickfun"
                                        options={{height: 400}}
                                    />
                                </Col>
                                <Col lg={4} sm={1}>
                                    
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
