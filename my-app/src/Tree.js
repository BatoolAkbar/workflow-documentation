import React from 'react';
import { useD3 } from './hooks/useD3';
import * as d3 from "d3";
import './style.css';



function Tree(props) {

    
    // code from Mike Bostock example of Collapsible Tree: https://observablehq.com/@d3/collapsible-tree
    const ref = useD3(
        () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)
            const dx = 60
            const dy = width /4
            const margin = ({ top: 10, right: 120, bottom: 10, left: 400 })
            const tree = d3.tree().nodeSize([dx, dy])
            const data = props.wrapped

            var src_clr = "#ff08e6"
            var src_name_clr = "#00ffff"
            var db_clr = "#d9ff00"
            var report_clr = "#8f5cff"
            var view_clr = "#eda6ff"
            var table_clr = "white"

            drawViz(data);

            function drawViz(data) {

                d3.select(".node-container")
                .remove()
                
                const root = d3.hierarchy(data);

                root.x0 = dy / 6;
                root.y0 = 0;
                root.descendants().forEach((d, i) => {
                    d.id = i;
                    d._children = d.children;
                    if (d.depth && d.data.length !== 7) d.children = null;
                });

                const svg = d3.select("#tree")
                    .attr("viewBox", [-margin.left, -margin.top, width, dx])
                    .style("user-select", "none");
                svg.selectAll("*").remove()

                const gLink = svg.append("g")
                    .attr("fill", "none")
                    .attr("stroke", "grey")
                    .attr("stroke-opacity", 0.5)
                    .attr("stroke-width", 0.5);

                const gNode = svg.append("g")
                    .attr("cursor", "pointer")
                    .attr("pointer-events", "all");

                function update(source, event) {
                    const duration = event && event.altKey ? 2500 : 250;
                    const nodes = root.descendants().reverse();
                    const links = root.links();

                    // Compute the new tree layout.
                    tree(root);

                    let left = root;
                    let right = root;
                    root.eachBefore(node => {
                        if (node.x < left.x) left = node;
                        if (node.x > right.x) right = node;
                    });

                    const height = right.x - left.x + margin.top + margin.bottom;

                    const transition = svg.transition()
                        .duration(duration)
                        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
                        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

                    // Update the nodes…
                    const node = gNode.selectAll("g")
                        .data(nodes, d => d.id);

                    // Enter any new nodes at the parent's previous position.
                    const nodeEnter = node.enter().append("g")
                        .attr("transform", d => `translate(${source.y0},${source.x0})`)
                        .attr("fill-opacity", 0)
                        .attr("stroke-opacity", 0)
                        .on("click", (event, d) => {
                            d.children = d.children ? null : d._children;
                            update(d);
                        });


                    function colorScale(d) {
                        if (d.data.source) {
                            return src_clr
                        } if (d.data.source_name) {
                            return src_name_clr
                        } if (d.data.db_name) {
                            return db_clr
                        } if (d.data.report_name) {
                            return report_clr
                        } if (d.data.main_view) {
                            return view_clr
                        } else {
                            return table_clr
                        }
                    }

                    nodeEnter.append("circle")
                        .attr("r", 8)
                        .attr("fill", d => colorScale(d))
                        .attr("stroke-width", 10);

                    nodeEnter.append("text")
                        .attr("dy", "0.25em")
                        .attr("x", d => d._children ? -15 : 6)
                        .attr("text-anchor", d => d._children ? "end" : "start")
                        .attr("class", "tree")
                        .text(d => d.data.name)
                        .attr("fill", "black")
                        .clone(true).lower()
                        .attr("stroke-linejoin", "round")


                    // Transition nodes to their new position.
                    node.merge(nodeEnter).transition(transition)
                        .attr("transform", d => `translate(${d.y},${d.x})`)
                        .attr("fill-opacity", 1)
                        .attr("stroke-opacity", 1);

                    // Transition exiting nodes to the parent's new position.
                    node.exit().transition(transition).remove()
                        .attr("transform", d => `translate(${source.y},${source.x})`)
                        .attr("fill-opacity", 0)
                        .attr("stroke-opacity", 0);

                    // Update the links…
                    const link = gLink.selectAll("path")
                        .data(links, d => d.target.id);

                    // Enter any new links at the parent's previous position.
                    const linkEnter = link.enter().append("path")
                        .attr("d", d => {
                            const o = { x: source.x0, y: source.y0 };
                            return diagonal({ source: o, target: o });
                        });

                    // Transition links to their new position.
                    link.merge(linkEnter).transition(transition)
                        .attr("d", diagonal);

                    // Transition exiting nodes to the parent's new position.
                    link.exit().transition(transition).remove()
                        .attr("d", d => {
                            const o = { x: source.x, y: source.y };
                            return diagonal({ source: o, target: o });
                        });

                    // Stash the old positions for transition.
                    root.eachBefore(d => {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });

                    svg.call(d3.zoom()
                        .extent([[0, 0], [width, height]])
                        .scaleExtent([0, 10])
                        .on("zoom", zoomed));

                    function zoomed(event, d) {
                        gNode.attr("transform", event.transform);
                        gLink.attr("transform", event.transform);

                    }
                }

                update(root);
            }
        }, []
    )

    return (
        <div>
            <svg id="tree"></svg>
        </div>

    );
}

export default Tree;
