import React from 'react';
import '../style/style.css';


function Legend() {
  return (
    <div id="legend">
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"#ff08e6"}}></div><span>Source</span>
    </div>
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"#00ffff"}}></div><span>Source Name</span>
    </div>
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"#d9ff00"}}></div><span>Database</span>
    </div>
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"#8f5cff"}}></div><span>Report Name</span>
    </div>
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"#eda6ff"}}></div><span>Main View</span>
    </div>
    <div className="key-container">
        <div className="legend-keys" style={{backgroundColor:"white"}}></div><span>Table</span>
    </div>
</div>
  );
}

export default Legend;
