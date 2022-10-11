import React, { useState } from 'react';
import { Row } from 'react-bootstrap';
import LayoutView from './LayoutView'
import TreeView from './TreeView'
import '../style/style.css';

function Frame() {
  const json = require('../data/nested_no_lookback.json');
  const data = json.children
  const [view, setView] = useState("layout");

  // todo
  // make rough plan on how to clean components
  function handleLayout() {
    if (view == "layout") {
      return (
        <LayoutView view={'layout'} data={data} setView={setView} />
      )
    } else if (view == "tree") {
      return (
        <TreeView view={'tree'} json={json} data={data} setView={setView} />
      )
    }
  }
  return (
    <div className="frame-container">
      <Row>
        {handleLayout()}
      </Row>
    </div>
  )
}

export default Frame;
