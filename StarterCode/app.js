var xlabelsSelect
var xlabelsGroup

// Define SVG are dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define the dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG are to it, and set the dimensions
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group to the SVG area and translate it to the right and down to adhere to the set margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial params
var chosenXaxis = "age";
var chosenYaxis = "smokes";

// function used for updating x-scale var upon click 
function xScale(healthRiskData, chosenXaxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d[chosenXaxis]) * 0.8,
            d3.max(healthRiskData, d => d[chosenXaxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// ===== function yScale here??
function yScale(healthRiskData, chosenYaxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d[chosenYaxis]) * 0.8,
            d3.max(healthRiskData, d => d[chosenYaxis]) * 1.2
        ])
        .range([0, height]);
    return yLinearScale;
}
// function used for updating xAxis var upon click
function renderXAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}
function renderYAxes(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}


// function used for updating scatter group with a transition to new scatter plot
function renderXScatter(circlesGroup, newXscale, chosenXaxis) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[chosenXaxis]));
    
    return circlesGroup;
}

function renderYScatter(circlesGroup, newYscale, chosenYaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYscale(d[chosenYaxis]));
    
    return circlesGroup;
}

// function used for updating scatter group with new tooltip
function updateToolTip(chosenXaxis, circlesGroup) {

    var label;

    if (chosenXaxis === "age") {
        label = "Age (Median) ";
    }
    else if (chosenXaxis === "poverty") {
        label = "In Poverty (%) ";
    }
    else {
        label = "Household Income (Median) ";
    }
    
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .attr("class", "stateText")
        .attr("class", "stateCircle")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXaxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // add mouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        return circlesGroup;
}

// Load the data.csv file
d3.csv("data.csv").then(function(healthRiskData, err) {
    if (err) throw err;
    
    // Print the healthRiskData
    console.log(healthRiskData);
    
    // parse the data
    healthRiskData.forEach(function(data) {
        // ensure age is an integer
        data.age = +data.age;
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // create x scale function
    var xLinearScale = xScale(healthRiskData, chosenXaxis);
    
    // chosenYaxis = "smokes"

    // create y scale function
    var yLinearScale = yScale(healthRiskData, chosenYaxis);
    
    
    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // build the scatter chart using healthRiskData
    var scatterGroup = chartGroup.selectAll(".scatter")
        .data(healthRiskData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .classed("stateText", true)
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", 15)
        .attr("fill", ".stateCircle")
    chartGroup.selectAll(".scatter")
        .data(healthRiskData)
        .enter()
        .append("text", d => d.abbr)
        .attr("class", "stateText")
        .attr("font-size", 20)
        .attr("dx", d => xLinearScale(d[chosenXaxis]))
        .attr("dy", d => yLinearScale(d[chosenYaxis]))

    // create group for three x-axis labels
    xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .classed("xlabel", true);
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .classed("active", true)
        .text("Age (Median)");
    
    var inPovertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("In Poverty (%)");
    
    var householdIncomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height / 2})`)

    var smokingLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("aText", true)
        .text("Smoke (%)");
    
    var healthCareLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");
    
    var obeseLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
    // updateToolTip function
    var scatterGroup = updateToolTip(chosenXaxis, scatterGroup);

    xlabelsSelect = xlabelsGroup.selectAll("text")
    // console.log(xlabelsSelect)
    
    // x axis labels event listener
    xlabelsSelect
        .on("click", function() {
            // get value of selection
            console.log("click")
            var value = d3.select(this).attr("value");
            if (value !== chosenXaxis) {

                // replaces chosenXaxis with value
                chosenXaxis = value;
                // console.log(chosenXaxis);

                // updates x scale for new data
                xLinearScale = xScale(healthRiskData, chosenXaxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates scatter plot with new x values
                scatterGroup = renderXScatter(scatterGroup, xLinearScale, chosenXaxis);

                // updates tooltips with new info
                scatterGroup = updateToolTip(chosenXaxis, scatterGroup);

                // changes classes to change bold text
                if (chosenXaxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXaxis === "poverty") {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    householdIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdIncomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        console.log("click")
        var value = d3.select(this).attr("value");
        if (value !== chosenYaxis) {

            // replaces chosenXaxis with value
            chosenYaxis = value;
            // console.log(chosenYaxis);

            // updates x scale for new data
            yLinearScale = yScale(healthRiskData, chosenYaxis);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates scatter plot with new x values
            scatterGroup = renderYScatter(scatterGroup, yLinearScale, chosenYaxis);

            // updates tooltips with new info
            scatterGroup = updateToolTip(chosenYaxis, scatterGroup);

            // changes classes to change bold text
            if (chosenYaxis === "smokes") {
                smokingLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthCareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYaxis === "healthcare") {
                smokingLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthCareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                smokingLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthCareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch(function(error) {
    console.log(error);
});

