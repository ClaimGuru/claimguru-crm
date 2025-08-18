// Export service for analytics data
export async function exportToPDF(analyticsData: any, activeTab: string, filename: string) {
  try {
    // Create a simplified HTML representation for PDF
    const htmlContent = generateHTMLReport(analyticsData, activeTab);
    
    // Create a blob with HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('PDF export completed (as HTML)');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

export async function exportToCSV(analyticsData: any, activeTab: string, filename: string) {
  try {
    let csvContent = '';
    
    switch (activeTab) {
      case 'claims':
        csvContent = generateClaimsCSV(analyticsData.claims);
        break;
      case 'financial':
        csvContent = generateFinancialCSV(analyticsData.financial);
        break;
      case 'performance':
        csvContent = generatePerformanceCSV(analyticsData.performance);
        break;
      default:
        csvContent = generateAllDataCSV(analyticsData);
    }
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('CSV export completed');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

function generateHTMLReport(analyticsData: any, activeTab: string): string {
  const date = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ClaimGuru Analytics Report - ${activeTab}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>ClaimGuru Analytics Report</h1>
            <h2>${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analytics</h2>
            <p>Generated on: ${date}</p>
        </div>
        
        ${generateSectionHTML(analyticsData, activeTab)}
    </body>
    </html>
  `;
}

function generateSectionHTML(analyticsData: any, activeTab: string): string {
  switch (activeTab) {
    case 'claims':
      return generateClaimsHTML(analyticsData.claims);
    case 'financial':
      return generateFinancialHTML(analyticsData.financial);
    case 'performance':
      return generatePerformanceHTML(analyticsData.performance);
    default:
      return '<p>No data available</p>';
  }
}

function generateClaimsHTML(claimsData: any): string {
  return `
    <div class="section">
        <h3>Claims by Status</h3>
        <table>
            <tr><th>Status</th><th>Count</th></tr>
            ${claimsData.byStatus.map((item: any) => 
              `<tr><td>${item.name}</td><td>${item.value}</td></tr>`
            ).join('')}
        </table>
    </div>
    
    <div class="section">
        <h3>Claims by Severity</h3>
        <table>
            <tr><th>Severity</th><th>Count</th><th>Total Value</th></tr>
            ${claimsData.bySeverity.map((item: any) => 
              `<tr><td>${item.severity}</td><td>${item.count}</td><td>$${item.value.toLocaleString()}</td></tr>`
            ).join('')}
        </table>
    </div>
  `;
}

function generateFinancialHTML(financialData: any): string {
  return `
    <div class="section">
        <h3>Revenue Overview</h3>
        <table>
            <tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr>
            ${financialData.revenue.map((item: any) => 
              `<tr><td>${item.month}</td><td>$${item.revenue.toLocaleString()}</td><td>$${item.expenses.toLocaleString()}</td><td>$${item.profit.toLocaleString()}</td></tr>`
            ).join('')}
        </table>
    </div>
  `;
}

function generatePerformanceHTML(performanceData: any): string {
  return `
    <div class="section">
        <h3>User Productivity</h3>
        <table>
            <tr><th>User</th><th>Claims Processed</th><th>Efficiency</th><th>Rating</th></tr>
            ${performanceData.userProductivity.map((item: any) => 
              `<tr><td>${item.user}</td><td>${item.claimsProcessed}</td><td>${item.efficiency}%</td><td>${item.rating}/5</td></tr>`
            ).join('')}
        </table>
    </div>
  `;
}

function generateClaimsCSV(claimsData: any): string {
  let csv = 'Claims Analytics Report\n\n';
  
  csv += 'Claims by Status\n';
  csv += 'Status,Count\n';
  claimsData.byStatus.forEach((item: any) => {
    csv += `${item.name},${item.value}\n`;
  });
  
  csv += '\nClaims by Severity\n';
  csv += 'Severity,Count,Total Value\n';
  claimsData.bySeverity.forEach((item: any) => {
    csv += `${item.severity},${item.count},${item.value}\n`;
  });
  
  csv += '\nClaims Volume Trend\n';
  csv += 'Month,New Claims,Settled Claims\n';
  claimsData.volumeTrend.forEach((item: any) => {
    csv += `${item.month},${item.claims},${item.settled}\n`;
  });
  
  return csv;
}

function generateFinancialCSV(financialData: any): string {
  let csv = 'Financial Analytics Report\n\n';
  
  csv += 'Revenue Overview\n';
  csv += 'Month,Revenue,Expenses,Profit\n';
  financialData.revenue.forEach((item: any) => {
    csv += `${item.month},${item.revenue},${item.expenses},${item.profit}\n`;
  });
  
  csv += '\nExpense Breakdown\n';
  csv += 'Category,Amount,Percentage\n';
  financialData.expenseBreakdown.forEach((item: any) => {
    csv += `${item.category},${item.amount},${item.percentage}\n`;
  });
  
  return csv;
}

function generatePerformanceCSV(performanceData: any): string {
  let csv = 'Performance Analytics Report\n\n';
  
  csv += 'User Productivity\n';
  csv += 'User,Claims Processed,Efficiency,Rating\n';
  performanceData.userProductivity.forEach((item: any) => {
    csv += `${item.user},${item.claimsProcessed},${item.efficiency},${item.rating}\n`;
  });
  
  csv += '\nVendor Performance\n';
  csv += 'Vendor,Score,Response Time,Satisfaction\n';
  performanceData.vendorPerformance.forEach((item: any) => {
    csv += `${item.vendor},${item.score},${item.responseTime},${item.satisfaction}\n`;
  });
  
  return csv;
}

function generateAllDataCSV(analyticsData: any): string {
  let csv = 'Complete Analytics Report\n\n';
  csv += generateClaimsCSV(analyticsData.claims);
  csv += '\n\n';
  csv += generateFinancialCSV(analyticsData.financial);
  csv += '\n\n';
  csv += generatePerformanceCSV(analyticsData.performance);
  return csv;
}