import React from "react";
import SignupForm from "./SignupForm";
import { Container } from "react-bootstrap";

const MainContainer = () => {
  return (
    <Container className="center-align">
      <h3>Register Form</h3>
      <SignupForm />
    </Container>
  );
};

export default MainContainer;
