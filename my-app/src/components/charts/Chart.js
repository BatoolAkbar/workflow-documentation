import React from 'react';
import { useD3 } from '../../hooks/useD3';
import * as d3 from "d3";
import '../../style/style.css';
import { path } from 'd3';
let helper = require('./helpers');


function Chart(props) {

    useD3(
        () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const data = props.data

            drawViz(data[4]);

            function drawViz(branch) {
                const root = d3.hierarchy(branch);
                const links = root.links();
                const nodes = root.descendants();

                function drag(simulation) {
                    function dragstarted(event, d) {
                        if (!event.active) simulation.alphaTarget(0.5).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(event, d) {
                        d.fx = event.x;
                        d.fy = event.y;
                    }

                    function dragended(event, d) {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }

                    return d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended);
                }

                const simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink(links).distance(20).strength(1.5))
                    .force("charge", d3.forceManyBody().strength(-200))
                    .force("center", d3.forceCenter())
                    .force("x", d3.forceX())
                    .force("y", d3.forceY());

                const svg = d3.select("#viz")
                    .attr("viewBox", [-width / 3.5, -height / 2, width / 2, height]);
                svg.selectAll("*").remove()

                const link = svg.append("g")
                    .attr("stroke", "black")
                    .attr("stroke-opacity", 0.5)
                    .attr("stroke-weight", 0.25)
                    .selectAll("line")
                    .data(links)
                    .join("line");

                const div = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                function colorScale(d) {
                    const node_key = Object.keys(d.data)[0]
                    return `${node_key}-color`
                }

                function circleSize(d) {
                    const node_key = Object.keys(d.data)[0]
                    let keys = ['source', 'source_name', 'db_name', 'report_name', 'lookback', 'main_view', 'table_1', 'table_2', 'table_3']
                    let radius = []
                    for (let i = 0; i < keys.length; i++) {
                        radius.push(i * 2 + 2)
                    }

                    let myScale = d3.scaleOrdinal()
                        .domain(keys)
                        .range(radius.reverse());
                    return myScale(node_key)
                }

                function nodesLabels(d) {
                    const node_val = Object.values(d.data)[0]
                    return node_val
                }

                function tooltip(d) {
                    if (d.data.report_name) {
                        return d.data.name + "<br>" + "Lookback: " + d.data.lookback + " days"
                    }
                    else {
                        return d.data.name
                    }
                }

                function nodePathText(d) {
                    let keys = Object.keys(d.data)[0]
                    let nodePathTitle = `<span class="node-path-title">Selected Node Path:</span>`
                    let nodePath = `${nodePathTitle}`
                    let pathContainer = `<div class="node-text"> <div class="node-key" id="node-key-${keys}"></div>`
                    let parents = d.ancestors()
                    let parent_nodes = []
                    parents.forEach(e => {
                        parent_nodes.push(Object.values(e)[0].name)
                    })
                    let pathName = parent_nodes.forEach(e => {
                        nodePath += `${pathContainer}${e}</div>`
                    })
                    nodePath += `${pathName}`
                    return nodePath
                }

                const dots = svg.append("g")
                    .selectAll("circle")
                    .data(nodes)
                    .join("circle")
                    .attr("stroke", "black")
                    .attr("class", d => colorScale(d))
                    .attr("r", d => circleSize(d))
                    .call(drag(simulation))
                    .on("click", (event, d) => {
                        generateNodePath(d);
                    });

                const label = svg.selectAll("text")
                    .data(nodes)
                    .join("text")
                    .attr("class", "labels")
                    .attr("opacity", "0")
                    .text(d => nodesLabels(d))

                dots.on("mouseover", function (event, d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.8)
                    d3.select(this)
                        .style("stroke-width", "3px")
                    div.html(tooltip(d))
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 40) + "px");
                })

                    .on("mouseout", function () {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
                        d3.select(this)
                            .style("stroke-width", "1px")
                            .style("opacity", 1)
                    });


                const nodePath = d3.select(".toolbar").append("div")
                    .attr("class", "node-container")
                    .style("opacity", 0);

                function generateNodePath(d) {
                    nodePath
                        .style("opacity", 1)
                        .html(nodePathText(d))
                }

                svg.call(d3.zoom()
                    .extent([[0, 0], [width, height]])
                    .scaleExtent([1, 8])
                    .on("zoom", zoomed));

                function zoomed(event) {
                    link.attr("transform", event.transform);
                    label.attr("transform", event.transform);
                    dots.attr("transform", event.transform);
                }

                simulation.on("tick", () => {
                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    dots
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    label
                        .attr("x", d => d.x + 15)
                        .attr("y", d => d.y + 4);
                });

                function filterData(src, selected) {
                    return src.source == selected
                }

                function update(selectedSource) {
                    var dataFilter = data.filter(d => filterData(d, selectedSource))
                    drawViz(dataFilter[0])
                }

                function controlLabels() {
                    if (d3.select("#labels").property("checked")) {
                        label
                            .transition()
                            .duration(1000)
                            .attr("opacity", "1")
                    } else {
                        label
                            .transition()
                            .duration(1000)
                            .attr("opacity", "0")
                    }
                }

                d3.select("#labels").on("change", controlLabels);

                d3.select("#dropdown").on("change", function () {
                    var selectedOption = d3.select(this).property("value")
                    nodePath.remove()
                    update(selectedOption)
                })

            }

        }, []

    )
    return (
        <div>
            <svg id="viz"></svg>
        </div>
    );
}
export default Chart;
