import React, {Component, useEffect, useState} from 'react';
import {
    Container,
    Row,
    Col,
    Image
} from "react-bootstrap";

import "./Landing.css";

import justLogo from  "./assets/justLogo.png";

import $ from 'jquery';


const Landing = (props) => {

    return (
        <>
        {/* Main Body */}
        <Container fluid className="landingBody">
            <Row>
                <Col>
                    <div>
                        <Image src={justLogo}></Image>
                        <h4>Welcome To PickFun</h4>
                        <p className="text-center">Before you start Picking, let us know your location so we can notify you about free prize contests sponsored by businesses in your area.</p>
                    </div>
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default Landing;