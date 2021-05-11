import React, {useState, useEffect} from 'react';
import {
    Container, 
    Row,
    Col,
    Tab,
    Tabs,
    ListGroup,
    Image,
    Button,
    ResponsiveEmbed
} from "react-bootstrap";

import Questions from './Questions.js';

import avatar from '../assets/blue_avatar_200.png';

import { TwitterTimelineEmbed, TwitterShareButton, TwitterFollowButton, TwitterHashtagButton, TwitterMentionButton, TwitterTweetEmbed, TwitterMomentShare, TwitterDMButton, TwitterVideoEmbed, TwitterOnAirButton } from 'react-twitter-embed';

import "./Contest.css";
import { JsonWebTokenError } from 'jsonwebtoken';


const twitterRedirect = () => {
    window.open('https://www.twitter.com');
};
    
const Contest = ({ match }) => {     
        //get contest
    const [contest, setContest] = useState([]);
    const [isloaded, setLoaded] = useState(false);
    const [home, setHomeTeam] = useState([]);
    const [away, setAwayTeam] = useState([]);
    const [participation, setParticipation] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [allParts, setAllParts] = useState();
    const [activeParts, setActiveParts] = useState([]);
    const [contestWon, setContestWon] = useState(false);

    

    const getContest = async () => {
        try {
            console.log('getting contest');
            const res = await fetch(`/contestdetail/${match.params.id}`, {
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            console.log('parse data contest' + JSON.stringify(parseData));
            setContest(parseData);
            console.log('after contest set');
            
            getParticipationByContest(parseData);
            getEvent(parseData);
            getContestParticipations(parseData);
            
          } catch (err) {
            console.error(err.message);
          }
      };

      const getEvent = async (contestRec) => {
        try {
            console.log('event contest' + contestRec.event__c);
            const res = await fetch(`/event/` + contestRec.event__c, {
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            console.log(JSON.stringify(parseData));
            setHomeTeam(parseData[0]);
            setAwayTeam(parseData[1]);
            
        }catch(error) {
            console.error(error.message);
        }
    }

    const getContestParticipations = async (contestRec) => {
        try {
            console.log('get all contest participations');
            const res = await fetch(`/contestparticipations/` + contestRec.sfid ,{
                method: "GET",
                headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            setAllParts(parseData.length);
            var i;
            var activeParts = [];
            for (i = 0; i < parseData.length; i++) {
                if(parseData[i].status__c === 'Active'){
                    console.log('active' + parseData[i]);
                    activeParts.push(parseData[i]);
                }
              }
            setActiveParts(activeParts.length);
            console.log('before check');
            if(parseData.length > 1 && activeParts.length === 1){
                console.log('youre the last person in the contest');
                setContestWon(true);
            }
            setParticipations(activeParts);
        }catch (err) {
            console.error(err.message);
        }
    }

    const getParticipationByContest = async (contestRec) => {
        try {
            console.log('getting participation by cotnest');
            const res = await fetch(`/participationbycontest/` + contestRec.sfid ,{
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            setParticipation(parseData);
            setLoaded(true);
          } catch (err) {
            console.error(err.message);
          }
    }

    useEffect(() => {
        getContest();
        
        
      }, []);
        return ( (
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

                <Row className="rowBar">
                    <Col>
                    {contestWon &&
                                <div> You Won</div>
                            }
                    </Col>
                </Row>
                <Tabs fill>
                    <Tab eventKey="Questions" title="Questions">
                        <Row>
                            <Col>
                            

                            {isloaded &&
                                <Questions contestid={contest.sfid} contestQuestionText={contest.no_questions_text__c} contest={contest} participation_id={participation.externalid__c} partsfid={participation.sfid}/> 
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
                                <span >Participants Remaining: {activeParts}/{allParts}</span>
                            </Col>
                            <Col xs={3}>
                            
                            </Col>
                        </Row>
                        {participations.map(part => {
                        return <Row key={part.id}className="rowCard ">
                            <Col xs={3}className="text-right"> <Image src={avatar} roundedCircle height="50"></Image>  </Col>
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

export default Contest;