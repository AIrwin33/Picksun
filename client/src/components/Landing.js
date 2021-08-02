import React, {Component, useEffect, useState} from 'react';
import {
    Container,
    Row,
    Col,
    Image,
    Link
} from "react-bootstrap";

import "./Landing.css";

import justLogo from  "../assets/logoOnly.png";

import $ from 'jquery';


const Landing = (props) => {

    const handleLobby = async () => {
        console.log('handle lobby');

    }

    return (
        <>
        {/* Main Body */}
        <Container fluid className="landingBody">
            <Row className="justify-content-md-center pt-3 pb-3">
                <Col md={4}>
                </Col>
                <Col md={4} className="text-center">
                    <Image src={justLogo}></Image>
                    <h5 className="whiteText aptifer"> How to Pickfun</h5>
                    <p className="whiteText proxima">
                    <span className="whiteText aptifer fontBold">Pick</span>
                        Go to the Lobby and select a contest
                        Simple questions about ‘what will happen next?’ are published while the live event (ex: football game) takes place
                        Pick your answers before the timer reaches zero and then watch the live event to see if you were right
                        Participants are ‘knocked out’ from the competition after answering a certain number of questions incorredtly. 
                        Last player remaining wins the prize. If multiple participants survive to the contest’s end, the player with the fewest wrong answers wins. Prize is split if there’s a tie.
                    </p>
                    <p className="whiteText proxima">
                    <span className="whiteText aptifer fontBold">Fun</span>
                        Our contests cover short segements - such as one inning of a baseball game - so that fun and winning comes at you fast!
                        No complicated scoring systems. No math skills required.
                        You drive the action! uggest questions you want us to ask while the contest is underway.
                        Hangout! While contests take place, come chat about whatever you want with the moderator and fellow participants.
                    </p>
                    <Link className="btn btn-primary" label="lets go!" to='/Lobby'>Let's Go!</Link>
                </Col>
                <Col md={4}>
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default Landing;