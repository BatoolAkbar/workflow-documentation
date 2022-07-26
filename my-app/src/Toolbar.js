import React from 'react';
import Legend from './Legend'
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function Toolbar(props) {

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
              <span>Search</span>
              <input type="search" id="search"></input>
            </div>
           
          </div>
          <Legend />
        </div>
      </div>
    );
  }


}

export default Toolbar;
