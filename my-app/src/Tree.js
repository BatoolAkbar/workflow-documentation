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
            // dx is the distance between lines (line height)
            const dx = 70
            // dy is the distance between columns
            const dy = width / 3
            const margin = ({ top: 10, right: 120, bottom: 10, left: 400 })
            // d3.tree() d3 built in function creates a new tree layout
            const tree = d3.tree().nodeSize([dx, dy])
            const data = props.wrapped

            // nodes colors
            var src_clr = "#ff08e6"
            var src_name_clr = "#00ffff"
            var db_clr = "#d9ff00"
            var report_clr = "#8f5cff"
            var view_clr = "#eda6ff"
            var table_clr = "white"

            drawViz(data);

            // the big function that draw the whole tree 
            function drawViz(data) {
                //removing a section from the other chart's toolbar because we're in tree view
                d3.select(".node-container")
                    .remove()
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

                // code from https://bl.ocks.org/jjzieve/a743242f46321491a950
                // function returns the path to the searched node (object)
                function searchTree(obj, search, path) {
                    if (obj.name === search) { //if search is found return, add the object to the path and return it
                        path.push(obj);
                        return path;
                    }
                    else if (obj.children || obj._children) { //if children are collapsed d3 object will have them instantiated as _children
                        var children = (obj.children) ? obj.children : obj._children;
                        for (var i = 0; i < children.length; i++) {
                            path.push(obj);// we assume this path is the right one
                            var found = searchTree(children[i], search, path);
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
                const gLink = svg.append("g")
                    .attr("fill", "none")
                    .attr("stroke", "grey")
                    .attr("stroke-opacity", 0.5)
                    .attr("stroke-width", 0.5);

                // defining a group to hold all the nodes
                const gNode = svg.append("g")
                    .attr("cursor", "pointer")
                    .attr("pointer-events", "all");

                // function updates nodes positions when an event happens (click or search)
                function update(source, event) {
                    const duration = event && event.altKey ? 2500 : 250;
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
                        .attr("transform", d => `translate(${source.y0},${source.x0})`)
                        .attr("fill-opacity", 0)
                        .attr("stroke-opacity", 0)
                        .on("click", (event, d) => {
                            console.log(d, "DDD")
                            d.children = d.children ? null : d._children;
                            update(d);
                        });

                    // nodes colors
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

                    // drawing nodes
                    nodeEnter.append("circle")
                        .attr("r", 8)
                        .attr("fill", d => colorScale(d))
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
                function search() {
                    // Actual tags are in Toolbar.js
                    var input, inputValue, ul, li, a, i, searched_value;
                    input = document.getElementById('search');
                    inputValue = input.value.toUpperCase();
                    ul = document.getElementById("test");
                    li = ul.getElementsByTagName('li');

                    var results = [];

                    // Loop through all list items
                    for (i = 0; i < li.length; i++) {
                        a = li[i].getElementsByTagName("a")[0];
                        searched_value = a.textContent || a.innerText;
                        console.log(inputValue, "SEARCHED VALUE")


                        console.log(root, "ROOT")

                        const root2 = root.data.children.map((element) => {
                            return { ...element, children: element.children.filter((subElement) => subElement.name == inputValue) }
                        })

                        console.log(root2)

                        // filter children
                        if (searched_value.toUpperCase().indexOf(inputValue) > -1) {
                            var nested_children = root.data.children
                            results = nested_children.filter(obj => obj.name.toUpperCase().includes(inputValue))
                            console.log(results, "RESULTS")
                            // searched.children = searched.children ? null : searched._children;
                            // update(searched[0].data)

                        }



                        var paths = searchTree(root.data, searched_value, []);
                        // console.log(paths)
                        if (typeof (paths[0]) !== "undefined") {
                            openPaths(paths[0].children);
                        }
                        else {
                            console.log(searched_value + " not found!");
                        }
                    }
                }

                d3.select("#search")
                    .on("keydown", search)

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
