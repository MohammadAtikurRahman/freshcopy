const fs = require('fs');

const currentTime = new Date();
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

        // Calculate the total duration of all sessions in the array
        const totalDuration = timeArray.reduce((total, timeData) => {
            return total + (timeData.duration || 0);
        }, 0);

        // Add the total duration to the timeData object and save it to the file
        timeData.totalDuration = totalDuration;
        const jsonData = JSON.stringify(timeArray, null, 2);
        fs.writeFile('timeData.json', jsonData, (err) => {
            if (err) throw err;
            console.log('Time data saved to file');
        });

        // Print the total duration, first and last Windows start times in the console log
        const firstStartTime = new Date(timeArray[0].windowsStartTime);
        console.log('Total duration:', totalDuration, 'minutes');
        console.log('First Windows start time:', timeArray[0].windowsStartTime);
        console.log('Last Windows start time:', lastTimeData.windowsStartTime);
    }
});
