import React from 'react';
import Legend from './Legend'
import Search from './Search'
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function Toolbar(props) {
  const saveSvgAsPng = require('save-svg-as-png')
  const imageOptions = {
    scale: 1,
    encoderOptions: 0.8,
    backgroundColor: 'white',
    width: window.innerWidth,
    height: window.innerHeight,
    top: -window.innerHeight / 2,
    left: -window.innerWidth / 6,
  }


  const handleClick = () => {
    saveSvgAsPng.saveSvgAsPng(document.getElementById('tree'), 'api-tree.png', imageOptions);
  };

  const myData = props.data


  if (props.view == "layout") {
    return (
      <div>
        <div className="toolbar">
          <div className="filter-container">
            <div className="dropdown-container">
              <span>Select Source:</span>
              <select id="dropdown">
                {props.data.map(d => (
                  <option
                    key={d.name}
                    value={d.name}
                  >
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox">
              <input type="checkbox" id="labels" name="labels" value="labels" />
              <span>Labels</span>
            </div>
          </div>
          <Legend />
        </div>
      </div>
    );

  } else if (props.view == "tree") {

    return (
      <div>
        <div className="toolbar">
          <div className="filter-container">
            <div className="search">
              <input type="text" id="search" placeholder="Search for tables.." />
              <div id="test">
                {/* {console.log(props.data[0].name)} */}
                {props.data.map(d => (
                  <li key={d.children[0].name} id="span">
                    <a>{d.children[0].name}</a>
                  </li>
                ))}
              </div>
            </div>
            <button className="save-btn" onClick={handleClick}>
              DOWNLOAD
            </button>
          </div>
          <Legend />
        </div>
      </div>
    );
  }


}

export default Toolbar;
