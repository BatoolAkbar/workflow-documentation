import React from 'react';
import Legend from './Legend'
import '../style/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Toolbar(props) {
  const saveSvgAsPng = require('save-svg-as-png')
  const search_data = require('../data/search_data.json');

  search_data.forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.length !== 7) d.children = null;
  });

  const imageOptions = {
    scale: 1,
    encoderOptions: 0.8,
    backgroundColor: 'white',
    width: window.innerWidth,
    height: window.innerHeight,
    top: -window.innerHeight / 2,
    left: -window.innerWidth / 6,
  }

  const date = new Date();
  var day = date.getDate();
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];
  const monthName = monthNames[date.getMonth()]

  const handleClick = () => {
    saveSvgAsPng.saveSvgAsPng(document.getElementById('tree'), `db-tree-${monthName}-${day}.png`, imageOptions);
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
            <div className="search-container">
              <input type="text" id="search" placeholder="Search for tables.." /><button id="submit">Search</button>
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
