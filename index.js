const fs = require('fs');

const currentTime = new Date();
const currentDate = currentTime.toLocaleDateString(); // Get the current date as M/D/YYYY
const timeData = {
    windowsStartTime: currentTime.toLocaleString()
};

fs.readFile('timeData.json', 'utf8', (err, data) => {
    if (err) {
        if (err.code === 'ENOENT') {
            // If the file doesn't exist yet, create a new array with the new object
            const timeArray = [timeData];
            const jsonData = JSON.stringify(timeArray);
            fs.writeFile('timeData.json', jsonData, (err) => {
                if (err) throw err;
                console.log('Time data saved to file');
            });
        } else {
            throw err;
        }
    } else {
        // If the file exists, parse the JSON data and append the new object to the array
        const timeArray = JSON.parse(data);
        const lastTimeData = timeArray[timeArray.length - 1];
        const lastStartTime = new Date(lastTimeData.windowsStartTime);
        const duration = Math.floor((currentTime.getTime() - lastStartTime.getTime()) / (1000 * 60));
        timeData.duration = duration;
        timeArray.push(timeData);

        const jsonData = JSON.stringify(timeArray, null, 2);
        fs.writeFile('timeData.json', jsonData, (err) => {
            if (err) throw err;
            console.log('Time data saved to file');
        });

        // Filter the data to only include records for the current date
        const todaysData = timeArray.filter((item) => {
            const itemDate = new Date(item.windowsStartTime).toLocaleDateString();
            return itemDate === currentDate;
        });

        if (todaysData.length > 0) {
            // Calculate the total duration as the difference between the first and last Windows start times
            const firstStartTime = new Date(todaysData[0].windowsStartTime);
            const lastStartTime = new Date(todaysData[todaysData.length - 1].windowsStartTime);
            const totalDuration = Math.floor((lastStartTime.getTime() - firstStartTime.getTime()) / (1000 * 60));

            // Print the total duration, first and last Windows start times in the console log for today
            console.log('Total duration (today):', totalDuration, 'minutes');
            console.log('First Windows start time (today):', todaysData[0].windowsStartTime);
            console.log('Last Windows start time (today):', todaysData[todaysData.length - 1].windowsStartTime);
        } else {
            console.log('No data for today yet');
        }
    }
});
