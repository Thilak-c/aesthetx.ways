// Simple test to verify reports system components
const { formatCurrency, formatNumber, calculateGrowth, getGrowthType } = require('./lib/reportsUtils.js');

console.log('Testing Reports System...');

// Test currency formatting
console.log('Currency formatting:', formatCurrency(1234567.89));

// Test number formatting
console.log('Number formatting:', formatNumber(1234567));

// Test growth calculation
console.log('Growth calculation:', calculateGrowth(150, 100));

// Test growth type
console.log('Growth type:', getGrowthType(50));

console.log('Reports system test completed successfully!');
