import React, {useEffect, useState} from 'react';
import {Col, Container, Image, Row, Tab, Tabs,} from "react-bootstrap";

import Questions from './Questions.js';

import avatar from '../assets/blue_avatar_200.png';

import {TwitterTimelineEmbed} from 'react-twitter-embed';

import "./Contest.css";
import {SocketContext} from "../socket";
import {connect} from "react-redux";


const Contest = ({match}) => {
    //get contest
    const [contest, setContest] = useState([]);
    const [isloaded, setLoaded] = useState(false);
    const [home, setHomeTeam] = useState([]);
    const [away, setAwayTeam] = useState([]);
    const [participation, setParticipation] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [allParts, setAllParts] = useState();
    const [activeParts, setActiveParts] = useState([]);
    const socket = React.useContext(SocketContext)

    const getContest = async () => {
        console.log('getting contest');
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



            setTimeout(
                function() {
                    console.log('end of timeout');
                    getContestParticipations(contestRec);
                    
                },
                2000
            );
           
        } catch (error) {
            console.error(error.message);
        }
    }

    const getContestParticipations = async (contestRec) => {
        console.log('getting contest participations');
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
        console.log('getting participation be contest');
        try {
            const res = await fetch(`/participationbycontest/` + contestRec.sfid, {
                method: "GET",
                headers: {jwt_token: localStorage.token}
            });

            const parseData = await res.json();
            setParticipation(parseData);
            setLoaded(true);
        } catch (err) {
            console.error(err.message);
        }
    }

    const updateparts = async (childData) => {

        //
        
        console.log(childData);
        if(isloaded){
            console.log('loaded, do run');
            getContestParticipations(contest);
        }else{
            console.log('log check');
        }
        // var i;
        // for (i = 0; i < participations.length; i++) {
        //     console.log(participations[i]);
        //     if (participations[i].externalid__c === childData.externalid__c) {
        //         console.log('found');
        //         participations[i] = childData;
        //     }
        // }
        // console.log(participations);
    }

    useEffect(() => {
        getContest();

        socket.emit("set_contest_room", contest.id);
    }, []);
    return ((
            <>

                {/* Main Body */}
                <Container id="contestContainer">
                    <Row className="headerRow">
                        <Col xs={1} sm={1}>
                        </Col>
                        <Col xs={10} sm={10}>
                            <div className="scoreboard">
                                <Row>
                                    <Col sm={5}>
                                        <h5 className="text-center">{home.name}</h5>
                                    </Col>
                                    <Col sm={2}>
                                        <h5 className="text-center">vs.</h5>
                                    </Col>
                                    <Col sm={5}>
                                        <h5 className="text-center">{away.name}</h5>
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
                            <h4 className="whiteText fontBold">{contest.name}</h4>
                        </Col>
                        <Col xs={3} sm={3}>
                        </Col>
                    </Row>
                    <Tabs fill>
                        <Tab eventKey="Questions" title="Questions">
                            <Row>
                                <Col>


                                    {isloaded &&
                                    <Questions updatepart={updateparts} contestid={contest.sfid}
                                               contestQuestionText={contest.no_questions_text__c} contest={contest}
                                               participation_id={participation.externalid__c}
                                               partsfid={participation.sfid}
                                               />
                                    }
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey="Participants" title="Participants" className="pb-4 pt-4">

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
                                                Answers Allowed: {part.wrong_answers_allowed__c}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            })}
                        </Tab>
                        <Tab eventKey="Chat" title="Twitter">
                            <Row>
                                <Col>
                                    <TwitterTimelineEmbed
                                        sourceType="profile"
                                        screenName="playpickfun"
                                        options={{height: 400}}
                                    />
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Container>

            </>
        )
    )
}

export default connect()(Contest);
