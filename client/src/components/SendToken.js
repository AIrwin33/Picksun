import React, {Component, useState} from 'react';
import {
    Container, 
    Row,
    Col,
    Button,
    Form
} from "react-bootstrap";
import "./SendToken.css";

import { toast } from "react-toastify";


const onSubmitForm = () => {
    console.log('sending email');
}

const SendToken = (props) => {

    return (
        <>
        {/* Main Body */}
        <Container className="LoginBody">
            <Row>
                <Col className="mt-3">
                    <h4 className="text-center textWhite aptifer font20 ">Send Reset Token</h4>
                </Col>
            </Row>
            <Row>
                <Col sm={{ span: 6, offset: 3 }}>
                
                <Form onSubmit={onSubmitForm}>

                    <Form.Group>
                        <Form.Label className="textWhite proxima font16">Email</Form.Label>
                        <Form.Control className="proxima" type="text" name="email" placeholder="email" onChange={e => onChange(e)} />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="btnRed float-right aptifer font20">
                        Send Reset Token
                    </Button>
                    
                </Form>
                </Col>
            </Row>
        </Container>

        </>
    )
}


export default SendToken;