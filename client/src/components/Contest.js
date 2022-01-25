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
    const [showInfo, setShowInfo] = useState(false);
    const [home, setHomeTeam] = useState([]);
    const [away, setAwayTeam] = useState([]);
    const [sport, setSport] = useState('baseball');
    const [key, setKey] = useState('Questions');
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
            setSport(parseData[0].sport__c);
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

    const handleInfoShow = async () => {

        setShowInfo(true);
    }
    //close info modal on question
    const handleInfoClose = async () => {

        setShowInfo(false);
    }

    const tabset = useCallback(() => {
        //updates participations in the contest as they are updated from questions.
        //passed up from questions js when answers are marked
        setKey('Participants');
    })

    const updateparts = useCallback(() => {
        console.log('update parts in contest');
        //updates participations in the contest as they are updated from questions.
        //passed up from questions js when answers are marked
        getContestParticipations(contest);
    })
    useEffect(() => {
        getContest().then(r =>  {
            console.log('here in contest', contest);
            socket.on("connect", () => {
                console.log('reconnectings')
                console.log('socket id::' + socket.id); 
              });

            socket.on("new_question", question => {
                console.log("new question");
                console.log('socket id::' + socket.id); 
                
                setNewQuestion(question);

            })
            socket.on("cor_question", question => {

                //Does not hit this when running into issues in mobile
                console.log("new correct question");
                console.log('socket id::' + socket.id); 
                setNewCorrectQuestion(question);
            })
            socket.on("new_contest", contest => {
                console.log('new_contest' + contest);
                console.log('socket id::' + socket.id); 
                
                setContest(contest);
            });

            socket.on('disconnect', () =>{
                console.log('reconnect fired!');
            });
 
            // console.log('before emit contest');
            // socket.emit("set_contest_room", match.params.id);
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
                        <Col xs={1} sm={3}></Col>
                        <Col xs={10} sm={6} className="text-center ">
                            <h4 className="whiteText fontBold aptifer">{contest.sub_title__c}</h4>
                        </Col>
                        <Col xs={1} sm={3}>
                        </Col>
                    </Row>
                    <Tabs activeKey={key} onSelect={(k) => setKey(k)} fill className="ml-2 mr-2">
                        <Tab eventKey="Questions" title="Questions" className="aptifer pb-4 pt-4">
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
                        <Tab eventKey="Participants" title="Participants" className="pb-4 pt-4 aptifer">

                            {/* loop through participations */}

                            <Row className="partCard">
                                <Col lg={3} sm={1}>

                                </Col>
                                <Col lg={6} sm={10} >
                                    <Row className="colCard justify-content-center "> 
                                        <span class="aptifer">Participants Remaining: {activeParts}/{allParts}</span>
                                        <div className="infoDiv mb-4">
                                            <a src="#" className="float-right" onClick={handleInfoShow} >
                                                <Image src={info} width="22"></Image>
                                            </a>
                                            <Modal className="modalDiv" show={showInfo} onHide={handleInfoClose}>
                                                <Modal.Header closeButton>
                                                <Modal.Title className="aptifer font16 modalHeader">How To Pick Fun</Modal.Title>
                                                </Modal.Header>
                                                <Modal.Body className="proxima font12 modalBody">
                                                    <span>
                                                        Pick an answer for each question. You’ll know you have unanswered questions when the countdown timer and bouncing ball image are present.
                                                    </span> <br/>
                                                    <span>
                                                        Before the countdown timer reaches zero, click ‘Submit Answers.’ The ‘Submit Answer’ button becomes clickable once you’ve picked answers for all available questions.
                                                    </span><br/>
                                                    <span>
                                                        Review your answers and results using left / right toggles.
                                                    </span><br/>
                                                    <span>
                                                        Keep your phone nearby when playing! Questions are published live in small batches.
                                                    </span><br/>
                                                    <span>
                                                        Keep track of how many answers you’ve gotten wrong + how many left until you’re knocked by looking at the ‘Wrong Answers’ indicator. When all circles (Knockout Limit) are filled in, you’ll be removed from the contest.
                                                    </span><br/>
                                                    <span>
                                                        Click ‘Participants’ to see who else is still alive in the contest.
                                                    </span><br/>
                                                    <span>
                                                        Access Twitter to communicate with us before, during or after contests.
                                                    </span><br/>
                                                    <span>
                                                        You’ll receive a prompt if you get knocked out and notification if you’re one of the winners. We’ll follow up with winners directly.
                                                    </span>

                                                    

                                                </Modal.Body>
                                                <Modal.Footer>
                                                <Button className="aptifer modalBtn" variant="secondary" onClick={handleInfoClose}>
                                                    Close
                                                </Button>
                                                </Modal.Footer>
                                            </Modal>
                                        </div>
                                    </Row>
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
                                </Col>
                                <Col lg={3} sm={1}>

                                </Col>
                            </Row>
                            
                        </Tab>
                        <Tab eventKey="Chat" title="Twitter" className="aptifer pb-4 pt-4">
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
