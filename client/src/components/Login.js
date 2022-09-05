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
    const [errorMsg, setErrorMsg] = useState();
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
          "/auth/login",
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
        setErrorMsg('That email and password are not valid');
      }
    };


    const registerRedirect = () => {
        window.location = "/Register";
    }

    const forgotPassword = () => {
      window.location = "/Resetpassword";
    }
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
                        <Form.Label className="textWhite proxima font16">Email</Form.Label>
                        <Form.Control className="proxima" type="text" name="email" placeholder="email" onChange={e => onChange(e)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="textWhite proxima font16">Password</Form.Label>
                        <Form.Control className="proxima" type="password" name="password" placeholder="password" onChange={e => onChange(e)}/>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="btnRed float-right aptifer font20">
                        Login
                    </Button>
                    {setErrorMsg !== null &&
                     <div className="errorDiv proxima fontBold">
                       <p>{errorMsg}</p>
                     </div> 
                    }
                </Form>
                </Col>
            </Row>
            <Row>
                <Col xs={1}>
                </Col>
                <Col xs={10} className="mt-3 mb-3 justify-content-center text-center">
                    <Button className="btnRed mt-3 aptifer font20" onClick={registerRedirect}>Sign Up</Button> <Button className="btnRed mt-3 aptifer font20" onClick={forgotPassword}>Forgot Password</Button>
                </Col>
                <Col xs={1}>
                </Col>
            </Row>
        </Container>

        </>
    )
}
export default Login;