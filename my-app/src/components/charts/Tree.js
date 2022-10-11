import React, { useState } from 'react';
import { useD3 } from '../../hooks/useD3';
import * as d3 from "d3";
import '../../style/style.css';
    
function Tree(props) {
    const search_data = require('../../data/search_data.json');

    search_data.forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.length !== 7) d.children = null;
    });

    // code from Mike Bostock example of Collapsible Tree: https://observablehq.com/@d3/collapsible-tree
    useD3(
        () => {
            const width = window.innerWidth;
            const margin = ({ top: 10, right: 120, bottom: 10, left: 400 })
            const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)
            // dx is the distance between lines (line height)
            const dx = 70
            // dy is the distance between columns
            const dy = width / 3
            // d3.tree() d3 built in function creates a new tree layout
            const tree = d3.tree().nodeSize([dx, dy])
            const data = props.wrapped

            // nodes: is an array of objects (nodes), each node contains an array of children (nodes)
            // root: root is an object contains all nodes and children and formatted in a tree data structure 
            // treePath & paths: an array of search results


            // tree layout expects a hierarchical data structure. d3.hierarchy() does that
            const root = d3.hierarchy(data);
            root.x0 = dy / 6;
            root.y0 = 0;

            // descendants() is a d3 built in function used to generate and return an array of descendant nodes
            root.descendants().forEach((d, i) => {
                d.id = i;
                d._children = d.children;
                if (d.depth && d.data.length !== 7) d.children = null;
            });

            //removing a section from the other chart's toolbar because we're in tree view
            d3.select(".node-container")
                .remove()

            // code from https://bl.ocks.org/jjzieve/a743242f46321491a950
            // function returns the path to the searched node (object)
            function searchTree(obj, searched, path) {
                if (obj.data.name === searched) { //if search is found return, add the object to the path and return it
                    path.push(obj);
                    return path;
                }
                else if (obj.children || obj._children) { //if children are collapsed d3 object will have them instantiated as _children
                    var children = (obj.children) ? obj.children : obj._children;
                    for (var i = 0; i < children.length; i++) {
                        path.push(obj);// we assume this path is the right one
                        var found = searchTree(children[i], searched, path);
                        if (found) {// we were right, this should return the bubbled-up path from the first if statement
                            return found;
                        }
                        else {//we were wrong, remove this parent from the path and continue iterating
                            path.pop();
                        }
                    }
                }
                else {//not the right object, return false so it will continue to iterate in the loop
                    return false;
                }
            }

            // function opens/expands the path of the searched node (object)
            function openPaths(paths) {
                for (var i = 0; i < paths.length; i++) {
                    if (paths[i].id !== "1") {//i.e. not root
                        paths[i].class = 'found';
                        if (paths[i]._children) { //if children are hidden: open them, otherwise: don't do anything
                            paths[i].children = paths[i]._children;
                            paths[i]._children = null;
                        }
                        update(paths[i]);
                    }
                }
            }

            // selecting div from dom with id=tree
            const svg = d3.select("#tree")
                .attr("viewBox", [-margin.left, -margin.top, width, dx])
                .style("user-select", "none");
            // removing svg to avoid tree duplication
            svg.selectAll("*").remove()

            // defining a group to hold all the links (lines that connect the nodes)
            const gLink = svg.append("g");

            // defining a group to hold all the nodes
            const gNode = svg.append("g")
                .attr("cursor", "pointer")
                .attr("pointer-events", "all");

            update(root);

            // function updates nodes positions when an event happens (click or search)
            function update(treePath) {
                var duration = 750;
                const nodes = root.descendants().reverse();

                // .links() is a d3 function that returns an array of links to the children of the node object, each link object has a source and a target field that hold references to child nodes.
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
                    // tween calculates attributes during transitions for smoother animation
                    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));
                // Update the nodes…
                const node = gNode.selectAll("g")
                    .data(nodes, d => d.id);
                // Enter any new nodes at the parent's previous position.
                const nodeEnter = node.enter().append("g")
                    .attr("transform", function (d) { return "translate(" + treePath.y0 + "," + treePath.x0 + ")"; })
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0)
                    .on("click", (event, node) => {
                        node.children = node.children ? null : node._children;
                        update(node);
                    });


                // nodes colors
                function colorScale(d) {
                    const node_key = Object.keys(d.data)[0]
                    return `${node_key}-color`
                }

                // drawing circles
                nodeEnter.append("circle")
                    .attr("r", 8)
                    .attr("class", d => colorScale(d))
                    .attr("stroke-width", 10);

                // labels
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
                    .attr("transform", d => `translate(${treePath.y},${treePath.x})`)
                    .attr("fill-opacity", 0)
                    .attr("stroke-opacity", 0);

                // Update the links…
                const link = gLink.selectAll("path")
                    .data(links, d => d.target.id);

                // Enter any new links at the parent's previous position.
                const linkEnter = link.enter().append("path")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = { x: treePath.x0, y: treePath.y0 };
                        return diagonal({ source: o, target: o });
                    });

                // Transition links to their new position.
                link.merge(linkEnter).transition(transition)
                    .attr("d", diagonal)
                    .style("stroke", function (d) {
                        if (d.target.class === "found") {
                            return "#929292";
                        }
                    })
                    .style("stroke-width", function (d) {
                        if (d.target.class === "found") {
                            return "1px";
                        }
                    });

                // Transition exiting nodes to the parent's new position.
                link.exit().transition(transition)
                    .attr("d", function (d) {
                        var o = { x: treePath.x, y: treePath.y };
                        return diagonal({ source: o, target: o });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                // ZOOM
                svg.call(d3.zoom()
                    .extent([[0, 0], [width, height]])
                    .scaleExtent([0, 10])
                    .on("zoom", zoomed));

                function zoomed(event, d) {
                    gNode.attr("transform", event.transform);
                    gLink.attr("transform", event.transform);
                }
            }
            // search function
            function search(e) {
                var search_input, inputValue, searched_value;
                search_input = document.getElementById('search');
                inputValue = search_input.value.toUpperCase();
                var searched_results = [];
                var flat_data_arr = []

                function removeDuplicates(arr) {
                    return [...new Set(arr)];
                }

                search_data.map(d => flat_data_arr.push(d.db_name, d.source, d.source_name, d.report_name, d.main_view, d.table_1, d.table_2))
                removeDuplicates(flat_data_arr)

                for (let i = 0; i < flat_data_arr.length; i++) {
                    searched_value = e.target.value
                    searched_results = flat_data_arr.filter(str => str.toUpperCase().includes(inputValue))
                }

                var paths = searchTree(root, searched_results[0], []);
                if (typeof (paths) !== "undefined") {
                    openPaths(paths);
                }
                else {
                    console.log(searched_results[0], " not found!");
                }
            }
            d3.select("#submit")
                .on("click", search)
        }, []
    )
    return (
        <div>
            <svg id="tree"></svg>
        </div>
    );
}
export default Tree;
