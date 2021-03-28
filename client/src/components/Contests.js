import React, {useState, useEffect} from 'react';
import {
    Container, 
    Row,
    Col,
    Image,
    Button,
    ResponsiveEmbed
} from "react-bootstrap";

import Moment from 'react-moment';

import moment from 'moment';

import kbAllDay from '../assets/kbAllDay.png';

import "./Contests.css";



const Contests = ({setAuth}) => {
    //get contests
    const [contests, setContests] = useState([]);

    const [time, setTime] = useState({ 
        twoHours: moment().add(2,'hours').toISOString(), 
        today: moment().endOf('day').endOf('day').toDate().toISOString(),
        tomorrow: moment().add(1, 'day').endOf('day').toDate().toISOString(),
        twoDays: moment().add(2, 'day').endOf('day').toDate().toISOString()
    });


    const getContests = async () => {
        try {
            const res = await fetch("/mycontests", {
              method: "GET",
              headers: { jwt_token: localStorage.token }
            });
      
            const parseData = await res.json();
            console.log('contests' + JSON.stringify(parseData));

            setContests(parseData);
          } catch (err) {
            console.error(err.message);
          }
      };
    useEffect(() => {
        getContests();
        
      }, []);
    
    const contestRedirect = async id => {

        //get existing contest and participation
        try {
            console.log('id' + id);
            const res = await fetch(
              "/participationbycontest/" + id,
              {
                method: "GET",
                headers: {
                  "Content-type": "application/json"
                }
              }
            );
            const parseRes = await res.json();
            console.log('created participation id ' + parseRes)
              console.log("Register Successfully");
              window.location = "/Contest/" + id;
            
          } catch (err) {
            console.error(err.message);
          }
    };
    return (
                (
            <>
            {/* Main Body */}
            <Container id="contestsContainer">
                <Row id="Hero" >
                    <Col className="m-3" >
                        <div>
                            <h4 className="text-center">
                                My Contests
                            </h4>
                        </div>
                    </Col>
                </Row>
                {contests.map(contest => (
                <Row key={contest.sfid} className="bodyRow ">
                    <Col className="bodyCol">
                        {/* if contest Start_Time__c  within 2 hours */}
                        {moment(contest.start_time__c).isSameOrAfter(time.today) && moment(contest.start_time__c).isSameOrBefore(time.twoHours) &&
                        <div>
                            <div className="gamesInProgress red">
                                <h5 className="text-center">
                                    In Progress
                                </h5>
                            </div>
                            <div>
                                <a onClick={() => contestRedirect(contest.id)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                        {/* if contest Start_Time__c is today*/}
                        {moment(contest.start_time__c).isSameOrAfter(time.today) && moment(contest.start_time__c).isSameOrBefore(time.tomorrow) &&
                        <div>
                            <div className="gamesInProgress">
                                <h5 className="text-center">
                                    Today
                                </h5>
                            </div>
                            <div>
                                <a onClick={() => contestRedirect(contest.id)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                        {/* if contest Start_Time__c is tomorrow*/}
                        {moment(contest.start_time__c).isSameOrAfter(time.tomorrow) && moment(contest.start_time__c).isSameOrBefore(time.twoDays) &&
                        <div>
                            <div className="gamesInProgress">
                                <h5 className="text-center">
                                    Tomorrow
                                </h5>
                            </div>
                            <div>
                                <a onClick={() => contestRedirect(contest.id)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                        {/* if contest Start_Time__c is today + 2*/}
                        {moment(contest.start_time__c).isSameOrAfter(time.twoDays) && 
                        <div>
                            <div className="gamesInProgress">
                                <h5 className="text-center">
                                {/* <Moment fromNow>
                                    {contest.start_time__c}
                                </Moment> */}

                                </h5>
                            </div>
                            <div>
                                <a onClick={() => contestRedirect(contest.id)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                    </Col>
                </Row>
                ))}

            </Container>

            </>
        )
    )
}

export default Contests;