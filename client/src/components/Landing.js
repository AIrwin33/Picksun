import React, {Component, useEffect, useState} from 'react';
import {
    Container,
    Row,
    Col,
    Image
} from "react-bootstrap";

import {
    Link
  } from "react-router-dom";

import "./Landing.css";

import justLogo from  "../assets/logoOnly.png";

import $ from 'jquery';


const Landing = (props) => {

    return (
        <>
        {/* Main Body */}
        <Container fluid className="landingBody">
            <Row className="justify-content-md-center pt-3 pb-3">
                <Col md={2} sm={1} lg={2}>
                </Col>
                <Col md={8} sm={10} lg={8}>
                    <Image src={justLogo}></Image>
                    <h5 className="whiteText aptifer"> How to Pickfun</h5>
                    <span className="whiteText aptifer fontBold text-center">Pick</span><br/>
                    <div className="justify-content-start">
                    <span className="whiteText proxima">Go to the Lobby and select a contest</span><br/>
                    <span className="whiteText proxima">Simple questions about ‘what will happen next?’ are published while the live event (ex: football game) takes place</span><br/>
                    <span className="whiteText proxima">Pick your answers before the timer reaches zero and then watch the live event to see if you were right</span><br/>
                    <span className="whiteText proxima">Participants are ‘knocked out’ from the competition after answering a certain number of questions incorrectly. </span><br/>
                    <span className="whiteText proxima">Last player remaining wins the prize. If multiple participants survive to the contest’s end, the player with the fewest wrong answers wins. Prize is split if there’s a tie.</span><br/><br/><br/>
                    </div>

                    <span className="whiteText aptifer fontBold text-center">Fun</span><br/>
                    <div className="justify-content-start">
                    <span className="whiteText proxima">Our contests cover short segments - such as one inning of a baseball game - so that fun and winning comes at you fast!</span><br/>
                    <span className="whiteText proxima">No complicated scoring systems. No math skills required.
                    </span><br/>
                    <span className="whiteText proxima">You drive the action! suggest questions you want us to ask while the contest is underway.</span><br/>
                    <span className="whiteText proxima">   Hangout! While contests take place, come chat about whatever you want with the moderator and fellow participants.</span><br/>
                    </div>
                    <Link className="btn btn-primary mt-3" label="lets go!" to='/Lobby'>Let's Go!</Link>
                </Col>
                <Col md={2} sm={1} lg={2}>
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default Landing;