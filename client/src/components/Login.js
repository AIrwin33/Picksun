import React, { Fragment, useState } from "react";
import { Link, Redirect } from "react-router-dom";

import { toast } from "react-toastify";

import {
    Container, 
    Row,
    Col,
    Image,
    Button,
    ResponsiveEmbed, Form
} from "react-bootstrap";
import LoginButton from '../components/LoginButton';


import "./Login.css";

const Login = ({ setAuth }) => {
    const [inputs, setInputs] = useState({
        email:"",
        password: ""
    });

    const { email, password } = inputs;
    const onChange = e =>
      setInputs({ ...inputs, [e.target.name]: e.target.value });
  
    const onSubmitForm = async e => {
      e.preventDefault();
      try {

        const body = { email,password };
        console.log('body' + JSON.stringify(body));
        const response = await fetch(
          "http://localhost:5000/auth/login",
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
      } catch (err) {
        console.error(err.message);
      }
    };


    const registerRedirect = () => {
        window.location = "/Register";
    }

    const forgotPassword = () => {
        console.log('forgot password');
    }
    return (
        <>
        {/* Main Body */}
        <Container fluid className="LoginBody">
            <Row>
                <Col >
                    <h4 className="text-center textWhite">Login</h4>
                </Col>
            </Row>
            <Row>
                <Col sm={{ span: 6, offset: 3 }}>
                
                <Form onSubmit={onSubmitForm}>

                    <Form.Group>
                        <Form.Label className="textWhite">Username</Form.Label>
                        <Form.Control type="text" name="email" placeholder="email" onChange={e => onChange(e)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="textWhite">Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder="password" onChange={e => onChange(e)}/>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="btnRed float-right">
                        Login
                    </Button>
                </Form>

                    {/* <form onSubmit={onSubmitForm}>
                        <input
                        type="text"
                        name="email"
                        value={email}
                        onChange={e => onChange(e)}
                        className="form-control my-3"
                        />
                        <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={e => onChange(e)}
                        className="form-control my-3"
                        />
                        <button className="btn btn-success btn-block">Submit</button>
                    </form> */}
                </Col>
            </Row>
            <Row>
                <Col xs={3}>
                </Col>
                <Col xs={6} className="mt-3 mb-3 justify-content-center text-center">
                    <Button className="btnRed" onClick={registerRedirect}>Sign Up</Button> <Button className="btnRed" onClick={forgotPassword}>Forgot Password</Button>
                </Col>
                <Col xs={3}>
                </Col>
            </Row>
        </Container>

        </>
    )
}
export default Login;