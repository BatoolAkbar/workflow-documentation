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
    encoderType: 'JPEG',
    width: window.innerWidth,
    height: window.innerHeight,    
    top: -window.innerHeight/2,
    left: -window.innerWidth/6,
  }

  
  const handleClick = () => {
    saveSvgAsPng.saveSvgAsPng(document.getElementById('tree'), 'shapes.png', imageOptions);
  };


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
            {/* <Search /> */}

              {/* <span>Search</span>
              <input type="search" id="search"></input> */}
            </div>


            <button className="save-btn" onClick={handleClick}>
              SAVE
            </button>
          </div>
          <Legend />
        </div>
      </div>
    );
  }


}

export default Toolbar;
