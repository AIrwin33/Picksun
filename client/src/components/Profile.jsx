import React, {useEffect, useState}from 'react';
import {
    Row,
    Tabs,
    Tab,
    Col,
    Image,
    ListGroup,
    Button,
    Form,
    Card,
    Container
} from "react-bootstrap";

import avatar from '../assets/blue_avatar_200.png';


import "./Profile.css";

const Profile = (props) => {

    const [profile, setProfile] = useState({
        favorite_team: "",
        favorite_sport: "",
        favorite_player: ""
    });

    const { favorite_team, favorite_sport, favorite_player } = profile;

    const onChange = e =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

    const onInvite = async e => {
        window.location.href = "mailto:username@example.com?subject=Join me on PickFun";
    }

    const getProfile = async () => {
      try {
        const res = await fetch("/profile", {
          method: "POST",
          headers: { jwt_token: localStorage.token }
        });
        const parseData = await res.json();
        setProfile(parseData);
      } catch (err) {
        console.error(err.message);
      }
    };

    const logout = async e => {
        e.preventDefault();
        try {
        localStorage.removeItem("token");
        props.setAuth(false);
        window.location = '/Lobby';
        } catch (err) {
        console.error(err.message);
        }
    }

    const onUpdateProfile = async id => {
        try {
            const body = {favorite_team, favorite_sport, favorite_player };
            console.log(body);

            const res = await fetch("/participant/" + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
              }
            );
      
            const parseData = await res.json();
            setProfile(parseData);
          } catch (err) {
            console.error(err.message);
          }
    }

    useEffect(() => {
        console.log('getting profile');
        getProfile();
        //set profile to true for changing background color
        props.setProfile(true);
    }, [props]);

    
    return (
        <>
        {/* Main Body */}
        <Container className="profileContainer">
            <Row  className="pt-3">
                <Col sm={3} xs={3} className="text-center">
                </Col>
                <Col sm={3} xs={3} className="text-center">
                    <Image src={avatar} roundedCircle height="75"></Image>
                </Col>
                <Col sm={3} xs={3} className="text-center">
                <Row className="mb-1 whiteText justify-content-center">
                    {profile.name}
                </Row>
                <Row className="justify-content-center">
                    <Button className="logoutBtn" onClick={e => logout(e)}>Log Out</Button>
                </Row>
                
                </Col>
                <Col sm={3} xs={3} className="text-center">
                </Col>
            </Row>
            <Row className="mt-3 mb-3">
                <Col sm={3} xs={3} >
                    <ul>
                        <li className="whiteText text-center">{profile.level_name}GOLD</li>
                        <li className="greyText text-center">Level</li>
                    </ul>
                 
                </Col>
                <Col sm={3} xs={3}>
                    <ul>
                        <li className="whiteText text-center">{profile.contest_count}</li>
                        <li className="greyText text-center">Contests</li>
                    </ul>
                </Col>
                <Col sm={3} xs={3} >
                    <ul>
                        <li className="whiteText text-center">{profile.win_count}</li>
                        <li className="greyText text-center">Wins</li>
                    </ul>
                </Col>
                <Col sm={3} xs={3} >
                    <ul>
                        <li className="whiteText text-center">{profile.follower_count}</li>
                        <li className="greyText text-center">Followers</li>
                    </ul>
                </Col>
            </Row>
            <Tabs className="ml-2 mr-2">
                <Tab className="profileTab ml-2 mr-2" eventKey="profile" title="Profile">
                    <Card>  
                    <Card.Header className="text-center">Profile</Card.Header>
                    <ListGroup variant="flush">
                        <ListGroup.Item>Member Since: {profile.member_since__c}</ListGroup.Item>
                        <ListGroup.Item>Favorite Team: {profile.favorite_team__c}</ListGroup.Item>
                        <ListGroup.Item>Favorite Sport: {profile.favorite_sport__c}</ListGroup.Item>
                        <ListGroup.Item>Favorite Player: {profile.favorite_player__c}</ListGroup.Item>
                    </ListGroup>
                    </Card>
                </Tab>
                <Tab className="profileTab ml-2 mr-2" eventKey="preferences" title="Preferences">
                    <Card>
                        <Card.Header className="text-center">Set Preferences</Card.Header>
                        <Form onSubmit={() => onUpdateProfile(profile.participant_id)} className="m-3">
                            <Form.Group controlId="formBasicTeam">
                                <Form.Label>Favorite Team</Form.Label>
                                <Form.Control type="text" name="favorite_team" placeholder="Chicago Bulls"  onChange={e => onChange(e)}/>   
                            </Form.Group>
                            <Form.Group controlId="formBasicSport">
                                <Form.Label>Favorite Sport</Form.Label>
                                <Form.Control type="text" name="favorite_sport" placeholder="Table Tennis" onChange={e => onChange(e)}/>
                            </Form.Group>
                            <Form.Group controlId="formBasicPlayer">
                                <Form.Label>Favorite Player</Form.Label>
                                <Form.Control type="text" name="favorite_player" placeholder="Table Tennis" onChange={e => onChange(e)}/>
                            </Form.Group>
                            <Button className="float-right" variant="primary" type="submit">
                                Update
                            </Button>
                        </Form>
                    </Card>
                </Tab>
            </Tabs>
        </Container>

        </>
    )
}

export default Profile;