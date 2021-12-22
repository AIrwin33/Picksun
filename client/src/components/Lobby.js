import React, {useEffect, useState} from 'react';
import {
    Container, 
    Row,
    Col,
    Button,
} from "react-bootstrap";

import "./Lobby.css";

const Lobby = () => {
     //get contests
     const [contests, setContests] = useState([]);
     const getAllContests = async () => {
         try {
             const res = await fetch("/allcontests", {
               method: "GET",
               headers: { jwt_token: localStorage.token }
             });
       
             const parseData = await res.json();
             setContests(parseData);
           } catch (err) {
             console.error(err.message);
           }
       };

       const enterContest = async (contest_id) => {
        try {

          const body = {contest_id};
          const response = await fetch(

            "/participations",
            {
              method: "POST",
              headers: {
                "Content-type": "application/json",
                jwt_token: localStorage.token
              },
              body: JSON.stringify(body)
            }
          );
          const parseRes = await response.json();
          
            window.location = "/Contest/" + contest_id;
          
        } catch (err) {
          console.error(err.message);
        }
           
       };
     useEffect(() => {
       getAllContests();
       }, []);
        return (
            <>
            {/* Main Body */}
            <Container className="lobbyContainer">
                <Row>
                    
                    {contests.map(contest => (
                    <Col xs={12} md={4}>
                        <div key={contest.id} className="LobbyCard mx-auto">
                            {contest.image_url__c != null &&
                            <div>
                                <img width="247" src={contest.image_url__c}/>
                            </div>
                            }
                            {contest.image_url__c == null && 
                            <div>
                                <img width="247" src={contest.image__c}/>
                            </div>
                            }
                            <p className="whiteText aptifer font16 text-center mt-1 mb-0">{contest.name}</p>
                            <p className="whiteText aptifer font12 text-center mt-1 mb-0">{contest.start_time_text__c}</p>
                            <Button className="btnRed aptifer font16 boldText" onClick={() => enterContest(contest.sfid)}>Start Picking</Button>
                        </div>
                      </Col>
                    ))}
                </Row>
            </Container>

            </>
            )
    
}

export default Lobby;