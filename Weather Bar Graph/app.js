 // Build a Bar Chart
    // Don't forget to slice and reverse the input data appropriately
    const barTrace = {
        x: sample_values.slice(0, 10).reverse(),
        y: yticks,
        text: otu_labels.slice(0, 10).reverse(),
        type: 'bar',
        orientation: 'h'
      };
  
      const barData = [barTrace];
  
      const barLayout = {
        title: 'Top 10 OTUs',
        xaxis: { title: 'Sample Values' },
        yaxis: { title: 'OTU ID' }
      };
  
  
  
      // Render the Bar Chart
      Plotly.newPlot('bar', barData, barLayout);
    });
  }