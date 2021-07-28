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
     const getProfile = async () => {
      try {
        const res = await fetch("/profile", {
          method: "POST",
          headers: { jwt_token: localStorage.token }
        });
  
        const parseData = await res.json();
        
      } catch (err) {
        console.error(err.message);
      }
    };
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

       const enterContest = async (id, contest_id) => {
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
       getProfile();
       getAllContests();
       }, []);
     
     

        return (
            <>
            {/* Main Body */}
            <Container className="lobbyContainer">
                <Row>
                    
                    {contests.map(contest => (
                    <Col xs={12} md={4}>
                        <div key={contest.id} className="LobbyCard">
                            <div>
                                <img width="247" src={contest.image__c}/>
                            </div>
                            <p className="whiteText aptifer">{contest.name}</p>
                            <Button className="btnRed" onClick={() => enterContest(contest.id, contest.sfid, )}>Start Picking</Button>
                        </div>
                      </Col>
                    ))}
                </Row>
            </Container>

            </>
            )
    
}

export default Lobby;