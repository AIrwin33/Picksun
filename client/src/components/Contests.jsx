import React, {useState, useEffect} from 'react';
import {
    Container, 
    Row,
    Col
} from "react-bootstrap";

import moment from 'moment';

import "./Contests.css";

const Contests = () => {
    //get contests
    const [contests, setContests] = useState([]);

    const [time, setTime] = useState({ 
        twoHours: moment().add(2,'hours').toISOString(), 
        today: moment().endOf('day').endOf('day').toDate().toISOString(),
        tomorrow: moment().add(1, 'day').endOf('day').toDate().toISOString(),
        twoDays: moment().add(2, 'day').endOf('day').toDate().toISOString()
    });


    const getMyContests = async () => {
        try {
            console.log('getting my contests');
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

      const contestRedirect = async sfid => {
        try {
            window.location = "/Contest/" + sfid;
            
          } catch (err) {
            console.error(err.message);
          }
    };
    useEffect(() => {
        getMyContests();
        
      }, []);
    
    
    return (
        (
            <>
            {/* Main Body */}
            <Container id="contestsContainer">
                <Row id="Hero" >
                    <Col className="m-3" >
                        <div>
                            <h4 className="text-center aptifer whiteText">
                                My Contests
                            </h4>
                        </div>
                    </Col>
                </Row>
                {contests.map(contest => (
                <Row key={contest.sfid} className="bodyRow">
                    <Col className="bodyCol">
                        {/* if contest Start_Time__c  within 2 hours */}
                        {moment(contest.start_time__c).isSameOrAfter(time.today) && moment(contest.start_time__c).isSameOrBefore(time.twoHours) &&
                        <div>
                            <div className="gamesInProgress red">
                                <h5 className="text-center aptifer mt-2">
                                    In Progress
                                </h5>
                            </div>
                            <div className="text-center">
                                <a className=" proxima" onClick={() => contestRedirect(contest.sfid)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                        {/* if contest Start_Time__c is today*/}
                        {moment(contest.start_time__c).isSameOrAfter(time.today) && moment(contest.start_time__c).isSameOrBefore(time.tomorrow) &&
                        <div>
                            <div className="gamesInProgress">
                                <h5 className="text-center aptifer  mt-2">
                                    Today
                                </h5>
                            </div>
                            <div className="text-center">
                                <a className=" proxima" onClick={() => contestRedirect(contest.sfid)}>
                                    {contest.name}
                                </a>
                            </div>
                        </div>
                        }
                        {/* if contest Start_Time__c is tomorrow*/}
                        {moment(contest.start_time__c).isSameOrAfter(time.tomorrow) && moment(contest.start_time__c).isSameOrBefore(time.twoDays) &&
                        <div>
                            <div className="gamesInProgress">
                                <h5 className="text-center aptifer  mt-2">
                                    Tomorrow
                                </h5>
                            </div>
                            <div  className="text-center">
                                <a className="proxima" onClick={() => contestRedirect(contest.sfid)}>
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
                            <div  className="text-center">
                                <a className=" proxima" onClick={() => contestRedirect(contest.sfid)}>
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