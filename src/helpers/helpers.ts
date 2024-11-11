// Define an interface for the month object
interface Month {
    month: string;
  }
  
  // Function to generate all months between a start and end date
  const generateAllMonths = (start: string, end: string): Month[] => {
    const months: Month[] = []; // Explicitly set the type for months array
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      months.push({ month: monthString });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  export default generateAllMonths