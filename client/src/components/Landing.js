import React, {Component, useEffect, useState} from 'react';
import {
    Container,
    Row,
    Col,
    Image
} from "react-bootstrap";

import "./Landing.css";

import justLogo from  "../assets/logoOnly.png";

import $ from 'jquery';


const Landing = (props) => {

    return (
        <>
        {/* Main Body */}
        <Container fluid className="landingBody">
            <Row className="justify-content-md-center pt-3 pb-3">
                <Col md={4}>
                </Col>
                <Col md={4} className="text-center">
                    <Image src={justLogo}></Image>
                    <h4 className="whiteText aptifer">Welcome To PickFun</h4>
                    <p className="whiteText proxima">Before you start Picking, let us know your location so we can notify you about free prize contests sponsored by businesses in your area.</p>
                </Col>
                <Col md={4}>
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default Landing;