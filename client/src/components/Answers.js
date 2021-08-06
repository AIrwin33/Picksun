import React, {useEffect, useState} from 'react';
import {Carousel, Col, Button, Container, Modal, Row, Image} from "react-bootstrap";


import "./Answers.css";

import $ from 'jquery';

const Answers = (props) => {

    const [answers, setAnswers] = useState([]);


    const getWrongTotal = async (infoWrong, infoTotal) => {
        var ans = [];

        for (let i = 0;i < infoTotal.length; i++) {
            infoTotal[i].id = i;
            var an = infoTotal[i];
            ans.push(an);
        }
        console.log(ans);
        // for (let w = 0; w < infoWrong.length; w++) {
        //     infoWrong[w].wrong = true;
        //     ans.push(an);
        // }
        // setAnswers(ans);

    }

    useEffect(() => {
       getWrongTotal(props.wrong, props.total)
    }, [props]);

    return (
        <>
            <div>

                {/* if number wrong is  */}
                <h4>Wrong Answers:</h4>
                {/* return <div>{Array.from(Array(answers), (e, i) => {
                    return <div  className={`circle ${answers.wrong ? "wrong" : ""}`} key={i}></div>
                })}</div> */}
            </div>
        </>
    )

}

export default Answers;