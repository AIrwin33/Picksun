import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";

import knockout from "../assets/knockedout.png";
import "./Answers.css";

const Answers = (props) => {

    const [answers, setAnswers] = useState([]);


    const getWrongTotal = async (infoWrong, infoTotal) => {
        var ans = [];
        for (var i = 0;i < infoTotal; i++) {
            var an = {
                id : i,
                wrong : false
            }
            ans.push(an);
        }

        for (var w = 0; w < infoWrong; w++) {
            ans[w].wrong = true;
        }
        setAnswers(ans);

    }

    useEffect(() => {

        getWrongTotal(props.wrong, props.total);

       

    }, [props]);

    return (
        <>
            <Row>
                <Col md={8}>  
                    <Row>
                        <Col md={4}>
                        <img alt="knockout limit" width='30' src={knockout}/>
                        </Col>
                        <Col md={8}>
                        <p className="font20">Knockout Limit:</p>
                        </Col>
                    </Row>
                </Col>
                <Col  md={4} className="d-flex justify-content-end">
                    <div className="d-inline-block">
                    {answers.map((answer, index) => {
                        return <div  className={`circle   ${answer.wrong ? "wrong" : ""}`} key={index}></div>
                    })}                
                    </div>
                </Col>

            </Row>
        </>
    )

}

export default Answers;