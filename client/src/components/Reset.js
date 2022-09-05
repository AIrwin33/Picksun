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



const ResetPassword = () => {

    const [inputs, setInputs] = useState({
        email:"",
        password: ""
    });

    const { email, password, confirmpassword } = inputs;

    const onChange = e =>
      setInputs({ ...inputs, [e.target.name]: e.target.value });


    const onSubmitForm = async e => {
        e.preventDefault();
        console.log('this');
        try {

            if(password !== confirmpassword){
                setErrorMsg('Passwords do not match');
            }else{

            

                const body = { email,password,confirmpassword };
                console.log('body' + JSON.stringify(body));
                const response = await fetch(
                "/auth/resetpassword",
                {
                    method: "POST",
                    headers: {
                    "Content-type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                );
        
                const parseRes = await response.json();
                if (parseRes.token) {
                localStorage.setItem("token", parseRes.token);
                setAuth(true);
                toast.success("Logged in Successfully");
                window.location = "/Lobby";
                } else {
                setAuth(false);
                toast.error(parseRes);
            }
            }
        } catch (err) {
            console.error(err.message);
            setErrorMsg('That email and password are not valid');
        }
        
    };
    return (
        <>
        {/* Main Body */}
        <Container className="LoginBody">
            <Row>
                <Col className="mt-3">
                    <h4 className="text-center textWhite aptifer font20 ">Reset Password</h4>
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
                        <Form.Control className="proxima" type="password" name="confirmpassword" placeholder="confirm password" onChange={e => onChange(e)} />
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