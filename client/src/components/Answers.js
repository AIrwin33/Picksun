import React, {useEffect, useState} from 'react';
import {Col, Row} from "react-bootstrap";

import knockout from "../assets/knockedout.png";
import "./Answers.css";

const Answers = (props) => {

    const [answers, setAnswers] = useState([]);

    const getWrongTotal = async (infoWrong, infoTotal) => {
        
        var ans = [];
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
        setAnswers(ans);

    }

    useEffect(() => {
        console.log(props.wrong);
        getWrongTotal(props.wrong, props.total);   

    }, [props]);

    return (
        <>
            <Row>
                <Col md={7} className="d-flex flex-row justify-content-end">  
                    <div >
                        <img alt="knockout limit" width='30' src={knockout}/>
                    </div>
                    <div>
                        <span className="font16">Knockout Limit:</span>
                    </div>
                </Col>
                <Col  md={5} className="d-flex justify-content-end">
                    <div className="d-inline-block pt-1">
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