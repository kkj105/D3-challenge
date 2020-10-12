// =================================
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

// function used for updating xAxis var upon click
function renderAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

// function used for updating scatter group with a transition to new scatter plot
function renderScatter(scatterGroup, newXscale, chosenXaxis) {

    scatterGroup.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[chosenXaxis]));
    
    return scatterGroup;
}

// function used for updating scatter group with new tooltip
function updateToolTip(chosenXaxis, scatterGroup) {

    var label;

    if (chosenXaxis === "age") {
        label = "Age (Median)";
    }
    else if (chosenAxis === "poverty") {
        label = "In Poverty (%)";
    }
    else {
        label = "Household Income (Median)";
    }
    
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXaxis]}`);
        });
    
    scatterGroup.call(toolTip);

    scatterGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // add mouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        return scatterGroup;
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
    
    chosenYaxis = "smokes"

    // create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthRiskData, d => d[chosenYaxis])])
        .range([height, 0]);
    
    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // build the scatter chart using healthRiskData
    var scatterGroup = chartGroup.selectAll(".scatter")
        .data(healthRiskData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        // .classed("stateText", true)
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", 15)
        // .attr("fill", ".stateCircle")
    
    // create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .classed("active", true)
        .text("Age (Median");
    
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
        .text("Household Income (Median");
    
    // create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var smokingLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Smoke (%)");
    
    var healthCareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");
    
    var obeseLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");
    
    // updateToolTip function
    var scatterGroup = updateToolTip(chosenXaxis, scatterGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXaxis) {

                // replaces chosenXaxis with value
                chosenXaxis = value;
                console.log(chosenXaxis);

                // updates x scale for new data
                xLinearScale = xScale(healthRiskData, chosenXaxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates scatter plot with new x values
                scatterGroup = renderScatter(scatterGroup, xLinearScale, chosenXaxis);

                // updates tooltips with new info
                scatterGroup = updateToolTip(chosenXaxis, scatterGroup);

                // changes classes to change bold text
                if (chosenXaxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    householdIncomeLabel
                        .classed("active", true)
                        .classed("incactive", false);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});

// ===================================