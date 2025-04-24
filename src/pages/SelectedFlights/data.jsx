import {format,eachDayOfInterval} from "date-fns";
export const data = [
    {
      id: 1,
      date: "2025-04-21",
      airline: "Emirates",
      iconColor: "red",
      baggage: "23kg",
      departure: "8:40AM",
      arrival: "10:00AM",
      duration: "3 hr 20 min",
      stops: "Direct",
      price: "549.10 USD"
    },
    {
      id: 2,
      date: "2025-04-21",
      airline: "Emirates",
      iconColor: "orange",
      baggage: "20kg",
      departure: "9:15AM",
      arrival: "11:05AM",
      duration: "1 hr 50 min",
      stops: "Direct",
      price: "299.50 USD"
    },
    {
      id: 3,
      date: "2025-04-21",
      airline: "SkyVoyage",
      iconColor: "teal",
      baggage: "25kg",
      departure: "11:30AM",
      arrival: "1:45PM",
      duration: "2 hr 15 min",
      stops: "1 Stop",
      price: "450.00 USD"
    },
    {
      id: 4,
      date: "2025-04-21",
      airline: "Qatar",
      iconColor: "red",
      baggage: "22kg",
      departure: "2:00PM",
      arrival: "4:10PM",
      duration: "2 hr 10 min",
      stops: "Direct",
      price: "385.70 USD"
    },
    {
      id: 5,
      date: "2025-04-21",
      airline: "Emirates",
      iconColor: "orange",
      baggage: "30kg",
      departure: "3:00PM",
      arrival: "5:30PM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "499.99 USD"
    },
    {
      id: 6,
      date: "2025-04-21",
      airline: "Qatar",
      iconColor: "teal",
      baggage: "15kg",
      departure: "4:15PM",
      arrival: "6:00PM",
      duration: "1 hr 45 min",
      stops: "1 Stop",
      price: "350.00 USD"
    },
    {
      id: 7,
      date: "2025-04-21",
      airline: "Qatar", 
      iconColor: "yellow",
      baggage: "18kg",
      departure: "6:30AM",
      arrival: "8:00AM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "280.00 USD"
    },
    {
      id: 8,
      date: "2025-04-21",
      airline: "NovaWings",
      iconColor: "purple",
      baggage: "27kg",
      departure: "10:45AM",
      arrival: "12:30PM",
      duration: "1 hr 45 min",
      stops: "1 Stop",
      price: "410.00 USD"
    },
    {
      id: 9,
      date: "2025-04-21",
      airline: "Qatar",
      iconColor: "blue",
      baggage: "24kg",
      departure: "5:00PM",
      arrival: "7:10PM",
      duration: "2 hr 10 min",
      stops: "Direct",
      price: "430.00 USD"
    },
    {
      id: 10,
      date: "2025-04-21",
      airline: "NimbusAir",
      iconColor: "green",
      baggage: "20kg",
      departure: "7:20PM",
      arrival: "9:15PM",
      duration: "1 hr 55 min",
      stops: "1 Stop",
      price: "320.00 USD"
    },
    {
      id: 11,
      date: "2025-04-21",
      airline: "FlyScape",
      iconColor: "red",
      baggage: "23kg",
      departure: "9:00AM",
      arrival: "10:30AM",
      duration: "1 hr 30 min",
      stops: "1 Stop",
      price: "520.00 USD"
    },
    {
      id: 12,
      date: "2025-04-22",
      airline: "OceanJet",
      iconColor: "orange",
      baggage: "20kg",
      departure: "10:00AM",
      arrival: "11:45AM",
      duration: "1 hr 45 min",
      stops: "1 Stop",
      price: "310.00 USD"
    },
    {
      id: 13,
      date: "2025-04-22",
      airline: "SkyVoyage",
      iconColor: "teal",
      baggage: "25kg",
      departure: "12:00PM",
      arrival: "2:10PM",
      duration: "2 hr 10 min",
      stops: "Direct",
      price: "470.00 USD"
    },
    {
      id: 14,
      date: "2025-04-22",
      airline: "AirGlide",
      iconColor: "red",
      baggage: "22kg",
      departure: "1:00PM",
      arrival: "3:05PM",
      duration: "2 hr 5 min",
      stops: "1 Stop",
      price: "370.00 USD"
    },
    {
      id: 15,
      date: "2025-04-22",
      airline: "JetStream",
      iconColor: "orange",
      baggage: "30kg",
      departure: "3:30PM",
      arrival: "6:00PM",
      duration: "2 hr 30 min",
      stops: "1 Stop",
      price: "520.00 USD"
    },
    {
      id: 16,
      date: "2025-04-22",
      airline: "CloudHopper",
      iconColor: "teal",
      baggage: "15kg",
      departure: "5:00PM",
      arrival: "6:30PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "340.00 USD"
    },
    {
      id: 17,
      date: "2025-04-22",
      airline: "SunFlyer",
      iconColor: "yellow",
      baggage: "18kg",
      departure: "7:00AM",
      arrival: "8:30AM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "290.00 USD"
    },
    {
      id: 18,
      date: "2025-04-22",
      airline: "NovaWings",
      iconColor: "purple",
      baggage: "27kg",
      departure: "11:00AM",
      arrival: "1:00PM",
      duration: "2 hr 0 min",
      stops: "Direct",
      price: "400.00 USD"
    },
    {
      id: 19,
      date: "2025-04-22",
      airline: "AeroDash",
      iconColor: "blue",
      baggage: "24kg",
      departure: "6:00PM",
      arrival: "8:10PM",
      duration: "2 hr 10 min",
      stops: "1 Stop",
      price: "440.00 USD"
    },
    {
      id: 20,
      date: "2025-04-22",
      airline: "NimbusAir",
      iconColor: "green",
      baggage: "20kg",
      departure: "8:00PM",
      arrival: "9:45PM",
      duration: "1 hr 45 min",
      stops: "Direct",
      price: "330.00 USD"
    },
    {
      id: 21,
      date: "2025-04-26",
      airline: "GlobalWings",
      iconColor: "blue",
      baggage: "25kg",
      departure: "6:15AM",
      arrival: "8:05AM",
      duration: "1 hr 50 min",
      stops: "Direct",
      price: "325.00 USD"
    },
    {
      id: 22,
      date: "2025-04-26",
      airline: "HorizonAir",
      iconColor: "green",
      baggage: "18kg",
      departure: "7:30AM",
      arrival: "10:45AM",
      duration: "3 hr 15 min",
      stops: "1 Stop",
      price: "275.50 USD"
    },
    {
      id: 23,
      date: "2025-04-26",
      airline: "PacificExpress",
      iconColor: "purple",
      baggage: "30kg",
      departure: "9:20AM",
      arrival: "11:10AM",
      duration: "1 hr 50 min",
      stops: "Direct",
      price: "410.00 USD"
    },
    {
      id: 24,
      date: "2025-04-26",
      airline: "AlpineAir",
      iconColor: "teal",
      baggage: "20kg",
      departure: "11:45AM",
      arrival: "2:15PM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "360.75 USD"
    },
    {
      id: 25,
      date: "2025-04-26",
      airline: "MetroJet",
      iconColor: "orange",
      baggage: "15kg",
      departure: "1:00PM",
      arrival: "4:30PM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "290.25 USD"
    },
    {
      id: 26,
      date: "2025-04-26",
      airline: "TitanAir",
      iconColor: "red",
      baggage: "28kg",
      departure: "3:15PM",
      arrival: "4:45PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "375.00 USD"
    },
    {
      id: 27,
      date: "2025-04-26",
      airline: "UrbanFlyer",
      iconColor: "yellow",
      baggage: "22kg",
      departure: "5:30PM",
      arrival: "8:50PM",
      duration: "3 hr 20 min",
      stops: "1 Stop",
      price: "340.50 USD"
    },
    {
      id: 28,
      date: "2025-04-26",
      airline: "EcoSky",
      iconColor: "green",
      baggage: "15kg",
      departure: "7:45PM",
      arrival: "9:15PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "310.00 USD"
    },
    {
      id: 29,
      date: "2025-04-26",
      airline: "RoyalAir",
      iconColor: "gold",
      baggage: "32kg",
      departure: "9:00PM",
      arrival: "11:30PM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "525.00 USD"
    },
    {
      id: 30,
      date: "2025-04-26",
      airline: "NightOwl",
      iconColor: "navy",
      baggage: "20kg",
      departure: "10:15PM",
      arrival: "1:45AM+1",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "295.75 USD"
    },
    {
      id: 31,
      date: "2025-04-29",
      airline: "AeroSwift",
      iconColor: "blue",
      baggage: "23kg",
      departure: "7:20AM",
      arrival: "9:35AM",
      duration: "2 hr 15 min",
      stops: "Direct",
      price: "335.00 USD"
    },
    {
      id: 32,
      date: "2025-04-29",
      airline: "BreezeAir",
      iconColor: "teal",
      baggage: "18kg",
      departure: "9:45AM",
      arrival: "12:15PM",
      duration: "2 hr 30 min",
      stops: "1 Stop",
      price: "285.50 USD"
    },
    {
      id: 33,
      date: "2025-04-29",
      airline: "CoastalWings",
      iconColor: "navy",
      baggage: "25kg",
      departure: "12:30PM",
      arrival: "2:45PM",
      duration: "2 hr 15 min",
      stops: "Direct",
      price: "395.00 USD"
    },
    {
      id: 34,
      date: "2025-04-29",
      airline: "DesertJet",
      iconColor: "orange",
      baggage: "20kg",
      departure: "3:15PM",
      arrival: "6:45PM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "310.25 USD"
    },
    {
      id: 35,
      date: "2025-04-29",
      airline: "EagleExpress",
      iconColor: "red",
      baggage: "30kg",
      departure: "6:30PM",
      arrival: "8:00PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "425.00 USD"
    },
    {
      id: 36,
      date: "2025-05-04",
      airline: "FalconAir",
      iconColor: "purple",
      baggage: "22kg",
      departure: "6:45AM",
      arrival: "9:15AM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "355.00 USD"
    },
    {
      id: 37,
      date: "2025-05-04",
      airline: "GulfStream",
      iconColor: "green",
      baggage: "15kg",
      departure: "10:00AM",
      arrival: "1:30PM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "265.75 USD"
    },
    {
      id: 38,
      date: "2025-05-04",
      airline: "HarborAir",
      iconColor: "blue",
      baggage: "28kg",
      departure: "1:45PM",
      arrival: "3:15PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "410.00 USD"
    },
    {
      id: 39,
      date: "2025-05-04",
      airline: "IslandHopper",
      iconColor: "teal",
      baggage: "20kg",
      departure: "4:00PM",
      arrival: "7:30PM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "330.50 USD"
    },
    {
      id: 40,
      date: "2025-05-04",
      airline: "JupiterAir",
      iconColor: "yellow",
      baggage: "25kg",
      departure: "7:15PM",
      arrival: "9:30PM",
      duration: "2 hr 15 min",
      stops: "Direct",
      price: "375.25 USD"
    },
    {
      id: 41,
      date: "2025-05-04",
      airline: "KiteAir",
      iconColor: "red",
      baggage: "18kg",
      departure: "9:45PM",
      arrival: "12:15AM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "345.00 USD"
    },
    {
      id: 42,
      date: "2025-05-02",
      airline: "LunaAir",
      iconColor: "silver",
      baggage: "30kg",
      departure: "5:30AM",
      arrival: "7:45AM",
      duration: "2 hr 15 min",
      stops: "Direct",
      price: "405.00 USD"
    },
    {
      id: 43,
      date: "2025-05-02",
      airline: "MountainAir",
      iconColor: "green",
      baggage: "22kg",
      departure: "8:00AM",
      arrival: "11:30AM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "320.50 USD"
    },
    {
      id: 44,
      date: "2025-05-02",
      airline: "NimbusAir",
      iconColor: "gray",
      baggage: "15kg",
      departure: "11:45AM",
      arrival: "1:15PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "295.00 USD"
    },
    {
      id: 45,
      date: "2025-05-02",
      airline: "OceanicAir",
      iconColor: "blue",
      baggage: "25kg",
      departure: "2:30PM",
      arrival: "5:00PM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "365.75 USD"
    },
    {
      id: 46,
      date: "2025-05-02",
      airline: "PolarisAir",
      iconColor: "navy",
      baggage: "20kg",
      departure: "5:15PM",
      arrival: "8:45PM",
      duration: "3 hr 30 min",
      stops: "1 Stop",
      price: "340.00 USD"
    },
    {
      id: 47,
      date: "2025-05-02",
      airline: "QuantumAir",
      iconColor: "purple",
      baggage: "28kg",
      departure: "8:00PM",
      arrival: "9:30PM",
      duration: "1 hr 30 min",
      stops: "Direct",
      price: "415.00 USD"
    },
    {
      id: 48,
      date: "2025-05-02",
      airline: "RocketAir",
      iconColor: "red",
      baggage: "18kg",
      departure: "9:45PM",
      arrival: "12:15AM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "355.50 USD"
    },
    {
      id: 49,
      date: "2025-05-02",
      airline: "StarlightAir",
      iconColor: "gold",
      baggage: "32kg",
      departure: "10:30PM",
      arrival: "1:00AM",
      duration: "2 hr 30 min",
      stops: "Direct",
      price: "485.00 USD"
    },
    {
      id: 50,
      date: "2025-05-02",
      airline: "TerraAir",
      iconColor: "green",
      baggage: "24kg",
      departure: "11:59PM",
      arrival: "2:45AM",
      duration: "2 hr 46 min",
      stops: "Direct",
      price: "395.25 USD"
    }
  ];
  export function cheapestPrices() {
    let dateFormattedData = {};
    data.forEach((value) => {
      if (!Object.hasOwn(dateFormattedData, value.date)) {
        const { date, ...rest } = value;
        dateFormattedData[date] = [rest];
      } else {
        const { date, ...rest } = value;
        dateFormattedData[date].push(rest);
      }
    });
    let datePricesFormatted = {};
  
    for (const date in dateFormattedData) {
      const flights = dateFormattedData[date];
      const lowestPrice = Math.min(
        ...flights.map((flight) => parseFloat(flight.price.replace(" USD", "")))
      );
      datePricesFormatted[date] = lowestPrice;
    }
  
    const allDates = [...new Set(data.map(item => item.date))];
  
    const minDate = new Date(Math.min(...allDates.map(d => new Date(d))));
    const maxDate = new Date(Math.max(...allDates.map(d => new Date(d))));
    
    const dateRange = eachDayOfInterval({ start: minDate, end: maxDate });
    
    const results = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        price: datePricesFormatted[dateStr] || null,
        hasFlights: Object.hasOwn(datePricesFormatted,dateStr),
      };
    });
    console.log(results)
    return results;
  }
  export function getDurationAndPrice(dataOfTheDay){
    let lowestPrice;
    let highestPrice;
    let lowestFlightDuration;
    let highestFlightDuration;

    [lowestPrice,highestPrice]=dataOfTheDay.reduce((acc,data)=> {
      const price = data.price.split(" ")[0];
      if (acc[0]>price)
      acc[0]=price;
      if (acc[1]<price)
        acc[1]=price;
    return acc;
    },[Infinity,0]);
    
    [lowestFlightDuration,highestFlightDuration]=dataOfTheDay.reduce((acc,data)=> {
      const date = (Number(data.duration.split(" ")[0]) + parseFloat(data.duration.split(" ")[2]/60));
      if (acc[0]>date)
      acc[0]=date;
      if (acc[1]<date)
        acc[1]=date;
    return acc;
    },[Infinity,0]);

    return {lowestPrice,highestPrice,lowestFlightDuration,highestFlightDuration}
  }