import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";

import knockout from "../assets/knockedout.png";
import "./Answers.css";

const Answers = (props) => {

    const [answers, setAnswers] = useState([]);


    const getWrongTotal = async (infoWrong, infoTotal) => {
        var ans = [];
        console.log('infowrong in answers' + infoWrong);
        for (var i = 0;i < infoTotal; i++) {
            if(i < infoWrong){
                var anw = {
                    id : i,
                    wrong : true
                }
                ans.push(anw);
            }else{
                var an = {
                    id : i,
                    
                    wrong : false
                }
                ans.push(an);
            }
        }
        console.log('ans' + ans);
        setAnswers(ans);

    }

    useEffect(() => {
        console.log('props wrong' + props.wrong);
        getWrongTotal(props.wrong, props.total);   

    }, [props]);

    return (
        <>
            <Row>
                <Col md={8} className="d-flex flex-row">  
                    <div >
                        <img alt="knockout limit" width='30' src={knockout}/>
                    </div>
                    <div>
                        <span className="font20">Knockout Limit:</span>
                    </div>
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