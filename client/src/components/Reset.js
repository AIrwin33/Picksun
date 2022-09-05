import React, {Component, useState} from 'react';
import {
    Container, 
    Row,
    Col,
    Button,
    Form
} from "react-bootstrap";
import "./Reset.css";

import { toast } from "react-toastify";

const onChange = e =>
      setInputs({ ...inputs, [e.target.name]: e.target.value });


const onSubmitForm = async e => {
    e.preventDefault();
    console.log('this');
}

const ResetPassword = (props) => {

    return (
        <>
        {/* Main Body */}
        <Container className="LoginBody">
            <Row>
                <Col className="mt-3">
                    <h4 className="text-center textWhite aptifer font20 ">Login</h4>
                </Col>
            </Row>
            <Row>
                <Col sm={{ span: 6, offset: 3 }}>
                
                <Form onSubmit={onSubmitForm}>

                    <Form.Group>
                        <Form.Label className="textWhite proxima font16">Password</Form.Label>
                        <Form.Control className="proxima" type="password" name="password" placeholder="password" onChange={e => onChange(e)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="textWhite proxima font16">Confirm Password</Form.Label>
                        <Form.Control className="proxima" type="password" name="confirm password" placeholder="confirm password" onChange={e => onChange(e)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="textWhite proxima font16">Email</Form.Label>
                        <Form.Control className="proxima" type="text" name="email" placeholder="email" onChange={e => onChange(e)} />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="btnRed float-right aptifer font20">
                        Reset Password
                    </Button>
                </Form>
                </Col>
            </Row>
        </Container>

        </>
    )

}


export default ResetPassword;