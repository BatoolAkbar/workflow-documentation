

Promise.all([
    d3.json('data/nested_wrapped.json'),

]).then(function (loadData) {

    const width = window.innerWidth;
    const height = window.innerHeight;


    var data = loadData[0].children

    drawViz(data[0]);
    function drawViz(branch) {

        console.log(branch)

        const root = d3.hierarchy(branch);
        const links = root.links();
        const nodes = root.descendants();

        var colors = ["#ff08e6", "#00ffff", "#d9ff00", "#6924ff", "#f157ff", "white", "white"]
        var cols = ["Source", "Source Name", "Database Name", "Report Name", "Lookback", "Main View", "Tables"]



        var legend_colorScale = d3.scaleOrdinal()
            .domain(cols)
            .range(colors)


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
            .force("link", d3.forceLink(links).id(d => d.id).distance(20).strength(1.5))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter())
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        const svg = d3.select("#viz")
            .append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

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

        // TODO
        // d3.scaleOrdinal

        function colorScale(d) {
            // if (d.data.name == 'API') {
            //     return "white"
            // }
            if (d.data.source) {
                return "#ff08e6"
            } if (d.data.source_name) {
                return "#00ffff"
            } if (d.data.db_name) {
                return "#d9ff00"
            } if (d.data.report_name) {
                return "#6924ff"
            } if (d.data.lookback) {
                return "#f157ff"
            } if (d.data.lookback == '0') {
                return "#f157ff"
            } if (d.data.main_view) {
                return "white"
            } else {
                return "white"
            }
        }

        // TODO
        // d3.scaleOrdinal

        function circleSize(d) {
            if (d.data.name == 'API') {
                return 35
            }
            if (d.data.source) {
                return 20
            } if (d.data.source_name) {
                return 14
            } if (d.data.db_name) {
                return 12
            } if (d.data.report_name) {
                return 10
            } if (d.data.lookback) {
                return 8
            } if (d.data.lookback == '0') {
                return 8
            } if (d.data.main_view) {
                return 6
            } else {
                return 4
            }
        }

        function nodesLabels(d) {
            if (d.data.source) {
                return d.data.source
            }
            if (d.data.source_name) {
                return d.data.source_name
            }
            if (d.data.report_name) {
                return d.data.report_name
            }
        }

        console.log("nodes", nodes)
        const dots = svg.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("stroke", "black")
            .attr("fill", d => colorScale(d))
            .attr("r", d => circleSize(d))
            .call(drag(simulation));

        const label = svg.selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "labels")
            .text(d => nodesLabels(d))

        dots.on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", 0.8)
            d3.select(this)
              .style("stroke-width", "3px")
            div.html(d.data.name)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 40) + "px");
        })

            .on("mouseout", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this)
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
            });

        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([1, 8])
            .on("zoom", zoomed));

        function zoomed() {
            link.attr("transform", d3.event.transform);
            label.attr("transform", d3.event.transform);
            dots.attr("transform", d3.event.transform);
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
            svg.remove()
            drawViz(dataFilter[0])
        }


        d3.select("#dropdown").on("change", function () {
            var selectedOption = d3.select(this).property("value")
            update(selectedOption)
        })

        // var legend = d3.select("#legend")
        //     .append("svg")
        //     .attr("width", "150px")
        //     .attr("height", "30px")
        //     .attr("class", "legend");

        // var legendContainer = legend.append("g")

        // legendContainer.selectAll("rects")
        //     .data(cols)
        //     .enter()
        //     .append("rect")
        //     .attr("x", d => d.length)
        //     .attr("y", 10)
        //     .attr("width", 15)
        //     .attr("height", 15)
        //     .attr("stroke", "black")
        //     .attr("fill", d => legend_colorScale(d))

        //     legendContainer.selectAll("texts")
        //     .data(cols)
        //     .enter()
        //     .append("text")
        //     .attr("x", d => d.length * 10 + 20)
        //     .attr("y", 20)
        //     .attr("class", "legend-keys")
        //     .text(cols)


    }

})




