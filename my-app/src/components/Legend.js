import React from 'react';
import '../style/style.css';

function Legend(props) {
    const legend_keys = Object.keys(props.data[0])
    legend_keys.splice(4, 9,'main_view', 'table_1')

    function formatKeys(str) {
        const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
        return capitalized.split("_").join(' ');
    }

    function generateLegend() {
        return legend_keys.map(function (key) {
            return (
            <div key={`${key}`} className="key-container">
                <div  id={`${key}-color`} className="legend-keys"></div><span>{formatKeys(key)}</span>
            </div>)
        });
    }

    return (
        <div id="legend">
            {generateLegend()}
        </div>
    )
}

export default Legend;
