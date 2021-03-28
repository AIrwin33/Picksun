import React, {Component, useEffect, useState} from 'react';
import {
    Container, 
    Row,
    Col,
    Image,
    Button,
    ResponsiveEmbed
} from "react-bootstrap";

import redbull from '../assets/redbull.png';


import "./Lobby.css";

const Lobby = ({ setAuth }) => {
     //get contests
     const [contests, setContests] = useState([]);
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const getProfile = async () => {
      try {
        const res = await fetch("/profile", {
          method: "POST",
          headers: { jwt_token: localStorage.token }
        });
  
        const parseData = await res.json();
        setIsAuthenticated(true);
        
      } catch (err) {
        console.error(err.message);
      }
    };
     const getContests = async () => {
         try {
           console.log('get contests before fetch');
             const res = await fetch("/contests", {
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
          console.log('contest_id' + contest_id);
          const body = {contest_id};
          console.log('body' + JSON.stringify(body));
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
            console.log("Participation Created Successfully");
            window.location = "/Contest/" + id;
          
        } catch (err) {
          console.error(err.message);
        }
           
       };
     useEffect(() => {
       getProfile();
         getContests();
       }, []);
     
     

        return (
            <>
            {/* Main Body */}
            <Container className="lobbyContainer">
                <Row>
                    <Col sm={1} xs={1}>
                    </Col>
                    <Col sm={10} xs={10}>
                    
                    {contests.map(contest => (
                        <div key={contest.id} className="LobbyCard">
                            <div>
                                <img width="250" src={redbull}/>
                            </div>
                            <p className="whiteText">{contest.name}</p>
                            <Button className="btnRed" onClick={() => enterContest(contest.id, contest.sfid, )}>Start Picking</Button>
                        </div>
                    ))}

                    </Col>
                    <Col sm={1} xs={1}>
                    </Col>
                </Row>
            </Container>

            </>
            )
    
}

export default Lobby;