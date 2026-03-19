import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

type SampleCategory = 'travel' | 'entertainment' | 'hospitality' | 'tour' | 'retail' | 'freelance' | 'generic'

interface SampleConfig {
  fileName: string
  industry: string
  headers: string[]
  rows: (string | number)[][]
  readme: string[][]
}

const SAMPLES: Record<SampleCategory, SampleConfig> = {
  travel: {
    fileName: 'sample_travel_agency.xlsx',
    industry: 'Travel',
    headers: ['first_name', 'last_name', 'destination', 'travel_date', 'return_date', 'ticket_cost', 'class', 'booking_ref', 'category', 'company_name'],
    rows: [
      ['Rajesh', 'Kumar', 'Dubai', '2025-07-15', '2025-07-22', 45000, 'Economy', 'BK-1001', 'Flight', 'Emirates Airlines'],
      ['Priya', 'Sharma', 'Singapore', '2025-08-01', '2025-08-07', 62000, 'Business', 'BK-1002', 'Flight', 'Singapore Airlines'],
      ['Amit', 'Patel', 'Bangkok', '2025-07-20', '2025-07-25', 28000, 'Economy', 'BK-1003', 'Flight', 'Thai Airways'],
      ['Sunita', 'Reddy', 'London', '2025-09-10', '2025-09-20', 85000, 'Premium Economy', 'BK-1004', 'Flight', 'British Airways'],
      ['Vikram', 'Singh', 'Maldives', '2025-08-15', '2025-08-20', 72000, 'Business', 'BK-1005', 'Flight', 'IndiGo'],
      ['Neha', 'Gupta', 'Paris', '2025-10-01', '2025-10-08', 95000, 'Economy', 'BK-1006', 'Flight', 'Air France'],
      ['Arjun', 'Nair', 'Bali', '2025-07-28', '2025-08-04', 38000, 'Economy', 'BK-1007', 'Flight', 'Garuda Indonesia'],
      ['Kavita', 'Joshi', 'Tokyo', '2025-09-05', '2025-09-12', 78000, 'Business', 'BK-1008', 'Flight', 'ANA'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Traveler first name'],
      ['last_name', 'Yes', 'Text', 'Traveler last name'],
      ['destination', 'Yes', 'Text', 'Travel destination city/country'],
      ['travel_date', 'Yes', 'Date (YYYY-MM-DD)', 'Departure date'],
      ['return_date', 'No', 'Date (YYYY-MM-DD)', 'Return date'],
      ['ticket_cost', 'Yes', 'Number', 'Cost of the ticket in INR'],
      ['class', 'No', 'Text', 'Travel class (Economy, Business, etc.)'],
      ['booking_ref', 'No', 'Text', 'Booking reference number'],
      ['category', 'Yes', 'Text', 'Booking category (Flight, Train, Bus)'],
      ['company_name', 'No', 'Text', 'Airline/carrier name'],
    ],
  },
  entertainment: {
    fileName: 'sample_movie_entertainment.xlsx',
    industry: 'Entertainment',
    headers: ['first_name', 'last_name', 'movie_name', 'show_date', 'showtime', 'seat_number', 'venue', 'ticket_cost', 'category'],
    rows: [
      ['Rahul', 'Verma', 'Interstellar IMAX', '2025-07-15', '19:30', 'A12', 'PVR Cinemas, Phoenix Mall', 850, 'Movie'],
      ['Anjali', 'Desai', 'Oppenheimer 4DX', '2025-07-16', '14:00', 'B5', 'INOX Megaplex, Andheri', 1200, 'Movie'],
      ['Karan', 'Mehta', 'Arijit Singh Live', '2025-08-10', '20:00', 'VIP-22', 'NSCI Dome, Mumbai', 5500, 'Concert'],
      ['Deepa', 'Pillai', 'Hamilton Musical', '2025-09-01', '18:30', 'C15', 'NCPA Theatre, Mumbai', 3500, 'Theatre'],
      ['Suresh', 'Iyer', 'Avatar 3 Premiere', '2025-07-20', '21:00', 'D8', 'Cinepolis, Seasons Mall', 950, 'Movie'],
      ['Meera', 'Kapoor', 'Stand-Up Comedy Night', '2025-08-05', '19:00', 'GA-44', 'Canvas Laugh Club', 1800, 'Comedy'],
      ['Rohit', 'Saxena', 'IPL Final 2025', '2025-05-25', '19:30', 'Premium-B12', 'Narendra Modi Stadium', 8500, 'Sports'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Customer first name'],
      ['last_name', 'Yes', 'Text', 'Customer last name'],
      ['movie_name', 'Yes', 'Text', 'Movie/show/event name'],
      ['show_date', 'Yes', 'Date (YYYY-MM-DD)', 'Date of the show'],
      ['showtime', 'No', 'Time (HH:MM)', 'Show start time'],
      ['seat_number', 'No', 'Text', 'Seat/ticket number'],
      ['venue', 'No', 'Text', 'Venue name and location'],
      ['ticket_cost', 'Yes', 'Number', 'Ticket cost in INR'],
      ['category', 'Yes', 'Text', 'Category (Movie, Concert, Theatre, etc.)'],
    ],
  },
  hospitality: {
    fileName: 'sample_hotel_booking.xlsx',
    industry: 'Hospitality',
    headers: ['first_name', 'last_name', 'hotel_name', 'check_in', 'check_out', 'room_type', 'nightly_rate', 'total_cost', 'category'],
    rows: [
      ['Anil', 'Bhatt', 'Taj Mahal Palace', '2025-07-15', '2025-07-18', 'Deluxe Suite', 12000, 36000, 'Hotel'],
      ['Smita', 'Rao', 'Oberoi Udaivilas', '2025-08-01', '2025-08-05', 'Premium Room', 18000, 72000, 'Hotel'],
      ['Vivek', 'Chauhan', 'ITC Grand Chola', '2025-07-20', '2025-07-22', 'Executive Room', 8500, 17000, 'Hotel'],
      ['Lakshmi', 'Menon', 'Leela Palace', '2025-09-10', '2025-09-14', 'Royal Suite', 25000, 100000, 'Hotel'],
      ['Gaurav', 'Tiwari', 'Rambagh Palace', '2025-08-15', '2025-08-17', 'Heritage Room', 15000, 30000, 'Hotel'],
      ['Pooja', 'Agarwal', 'Wildflower Hall', '2025-10-01', '2025-10-04', 'Valley View', 22000, 66000, 'Resort'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Guest first name'],
      ['last_name', 'Yes', 'Text', 'Guest last name'],
      ['hotel_name', 'Yes', 'Text', 'Hotel/resort name'],
      ['check_in', 'Yes', 'Date (YYYY-MM-DD)', 'Check-in date'],
      ['check_out', 'Yes', 'Date (YYYY-MM-DD)', 'Check-out date'],
      ['room_type', 'No', 'Text', 'Room type/category'],
      ['nightly_rate', 'No', 'Number', 'Rate per night in INR'],
      ['total_cost', 'Yes', 'Number', 'Total booking cost in INR'],
      ['category', 'Yes', 'Text', 'Category (Hotel, Resort, etc.)'],
    ],
  },
  tour: {
    fileName: 'sample_tour_package.xlsx',
    industry: 'Tour Operator',
    headers: ['first_name', 'last_name', 'package_name', 'start_date', 'end_date', 'pax_count', 'cost_per_person', 'total_cost', 'category'],
    rows: [
      ['Manish', 'Jain', 'Kerala Backwaters Explorer', '2025-08-10', '2025-08-14', 2, 15000, 30000, 'Tour'],
      ['Rekha', 'Bansal', 'Ladakh Adventure Tour', '2025-07-01', '2025-07-08', 4, 22000, 88000, 'Tour'],
      ['Sanjay', 'Mishra', 'Rajasthan Heritage Circuit', '2025-09-15', '2025-09-22', 2, 18000, 36000, 'Tour'],
      ['Asha', 'Kulkarni', 'Goa Beach Holiday', '2025-10-05', '2025-10-09', 3, 12000, 36000, 'Tour'],
      ['Ravi', 'Shetty', 'Andaman Island Getaway', '2025-08-20', '2025-08-26', 2, 28000, 56000, 'Tour'],
      ['Nandini', 'Prasad', 'Himachal Valley Trek', '2025-07-15', '2025-07-20', 1, 16000, 16000, 'Tour'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Customer first name'],
      ['last_name', 'Yes', 'Text', 'Customer last name'],
      ['package_name', 'Yes', 'Text', 'Tour package name'],
      ['start_date', 'Yes', 'Date (YYYY-MM-DD)', 'Tour start date'],
      ['end_date', 'Yes', 'Date (YYYY-MM-DD)', 'Tour end date'],
      ['pax_count', 'No', 'Number', 'Number of travelers'],
      ['cost_per_person', 'No', 'Number', 'Cost per person in INR'],
      ['total_cost', 'Yes', 'Number', 'Total package cost in INR'],
      ['category', 'Yes', 'Text', 'Category (Tour)'],
    ],
  },
  retail: {
    fileName: 'sample_retail.xlsx',
    industry: 'Retail',
    headers: ['first_name', 'last_name', 'item_name', 'quantity', 'unit_price', 'discount', 'total_cost', 'category'],
    rows: [
      ['Alok', 'Pandey', 'Samsung Galaxy S24 Ultra', 1, 124999, 5000, 119999, 'Electronics'],
      ['Divya', 'Shah', 'Sony WH-1000XM5', 2, 29990, 2000, 57980, 'Electronics'],
      ['Manoj', 'Chopra', 'Nike Air Max 270', 1, 12995, 1300, 11695, 'Footwear'],
      ['Swati', 'Dubey', 'Apple iPad Air M2', 1, 69900, 0, 69900, 'Electronics'],
      ['Tarun', 'Malhotra', 'Levi\'s 511 Slim Fit Jeans', 3, 3999, 400, 11597, 'Apparel'],
      ['Geeta', 'Bose', 'Dyson V15 Detect', 1, 62900, 5000, 57900, 'Home Appliances'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Customer first name'],
      ['last_name', 'Yes', 'Text', 'Customer last name'],
      ['item_name', 'Yes', 'Text', 'Product/item name'],
      ['quantity', 'No', 'Number', 'Quantity purchased'],
      ['unit_price', 'No', 'Number', 'Price per unit in INR'],
      ['discount', 'No', 'Number', 'Discount amount in INR'],
      ['total_cost', 'Yes', 'Number', 'Total cost in INR'],
      ['category', 'Yes', 'Text', 'Product category'],
    ],
  },
  freelance: {
    fileName: 'sample_freelancer.xlsx',
    industry: 'Freelance',
    headers: ['client_first_name', 'client_last_name', 'service_description', 'hours', 'hourly_rate', 'total_cost', 'project_name', 'category'],
    rows: [
      ['David', 'Williams', 'Full-stack web development', 40, 2500, 100000, 'E-commerce Platform Redesign', 'Development'],
      ['Sarah', 'Johnson', 'UI/UX design and prototyping', 25, 2000, 50000, 'Mobile App Interface', 'Design'],
      ['James', 'Brown', 'SEO audit and optimization', 15, 3000, 45000, 'Corporate Website SEO', 'Marketing'],
      ['Emily', 'Davis', 'Content writing and copywriting', 20, 1500, 30000, 'Blog Content Strategy', 'Content'],
      ['Michael', 'Wilson', 'DevOps and cloud setup', 30, 3500, 105000, 'AWS Infrastructure Migration', 'DevOps'],
      ['Lisa', 'Taylor', 'Data analysis and reporting', 18, 2800, 50400, 'Quarterly Sales Analytics', 'Analytics'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['client_first_name', 'Yes', 'Text', 'Client first name'],
      ['client_last_name', 'Yes', 'Text', 'Client last name'],
      ['service_description', 'Yes', 'Text', 'Description of service provided'],
      ['hours', 'No', 'Number', 'Number of hours worked'],
      ['hourly_rate', 'No', 'Number', 'Hourly rate in INR'],
      ['total_cost', 'Yes', 'Number', 'Total service cost in INR'],
      ['project_name', 'No', 'Text', 'Project name'],
      ['category', 'Yes', 'Text', 'Service category'],
    ],
  },
  generic: {
    fileName: 'sample_generic.xlsx',
    industry: 'Generic',
    headers: ['first_name', 'last_name', 'description', 'amount', 'tax', 'total', 'category', 'notes'],
    rows: [
      ['John', 'Doe', 'Consulting services for Q3 2025', 50000, 9000, 59000, 'Consulting', 'Monthly retainer'],
      ['Jane', 'Smith', 'Product supply order #4521', 25000, 4500, 29500, 'Supply', 'Recurring order'],
      ['Robert', 'Chen', 'Training workshop - 2 days', 35000, 6300, 41300, 'Training', 'On-site training'],
      ['Maria', 'Garcia', 'Annual maintenance contract', 120000, 21600, 141600, 'Maintenance', 'Yearly renewal'],
      ['Ahmed', 'Khan', 'Software license - Enterprise', 75000, 13500, 88500, 'Software', '12-month license'],
      ['Yuki', 'Tanaka', 'Translation services - Japanese', 15000, 2700, 17700, 'Translation', 'Document translation'],
    ],
    readme: [
      ['Column', 'Required', 'Data Type', 'Description'],
      ['first_name', 'Yes', 'Text', 'Customer/client first name'],
      ['last_name', 'Yes', 'Text', 'Customer/client last name'],
      ['description', 'No', 'Text', 'Item or service description'],
      ['amount', 'Yes', 'Number', 'Amount before tax'],
      ['tax', 'No', 'Number', 'Tax amount'],
      ['total', 'No', 'Number', 'Total amount (amount + tax)'],
      ['category', 'Yes', 'Text', 'Item/service category'],
      ['notes', 'No', 'Text', 'Additional notes'],
    ],
  },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as SampleCategory | null

  if (!category || !SAMPLES[category]) {
    // Return list of available samples
    const list = Object.entries(SAMPLES).map(([key, val]) => ({
      id: key,
      fileName: val.fileName,
      industry: val.industry,
      columnCount: val.headers.length,
      rowCount: val.rows.length,
    }))
    return NextResponse.json({ samples: list })
  }

  // Generate and return the Excel file
  const sample = SAMPLES[category]
  const wb = XLSX.utils.book_new()

  // Sheet 1: Data
  const wsData = XLSX.utils.aoa_to_sheet([sample.headers, ...sample.rows])
  
  // Set column widths
  wsData['!cols'] = sample.headers.map((h) => ({ 
    wch: Math.max(h.length + 2, 15) 
  }))
  
  XLSX.utils.book_append_sheet(wb, wsData, 'Data')

  // Sheet 2: README
  const wsReadme = XLSX.utils.aoa_to_sheet(sample.readme)
  wsReadme['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(wb, wsReadme, 'README')

  // Generate buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${sample.fileName}"`,
    },
  })
}
