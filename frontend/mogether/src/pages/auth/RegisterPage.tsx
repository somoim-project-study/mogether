import React from "react";
import Register from "../../components/auth/Register";
import styled from "styled-components";
import Header from "../Header";
import Footer from "../Footer";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // height: 100vh;
  // background-color: #e9ecef;
`;

const RegisterPage = () => {
  return (
    <PageContainer>
      <Header />
      <Register />
      <Footer />
    </PageContainer>
  );
};

export default RegisterPage;
