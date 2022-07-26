import React, { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import Header from './Header'
import Frame from './Frame'
import './style.css';

function App() {

 
  return (
    <div className="container-fluid">
          <Header />
          <Frame />
    </div>
  );
}

export default App;
