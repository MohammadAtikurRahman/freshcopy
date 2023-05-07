const axios = require('axios');
const axiosRetry = require('axios-retry');
const fs = require('fs');
const moment = require('moment-timezone');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const vlcUrl = 'http://127.0.0.1:8080';
const password = '1234'; // Replace this with the password you set in VLC settings

const jsonFilePath = 'playback_data.json';

let videoPlaying = false;
let startTime;
let fileName;
let fileLocation;

const formatTime = (time) => {
    return moment(time).tz('Asia/Dhaka').format('YYYY-MM-DD hh:mm:ss A');
};

const monitorPlayback = async () => {
    try {
        const response = await axios.get(`${vlcUrl}/requests/status.json`, {
            auth: {
                username: '',
                password: password,
            },
        });

        const data = response.data;
        const currentTime = new Date();

        console.log(`Current State: ${data.state}`);

        if (data.state === 'playing' && !videoPlaying) {
            startTime = currentTime;
            fileName = data.information.category.meta.filename;
            fileLocation = data.information.uri;
            videoPlaying = true;
            console.log('Video started playing.');
        } else if (data.state !== 'playing' && videoPlaying) {
            const endTime = currentTime;
            const duration = Math.round((endTime - startTime) / 1000);
            videoPlaying = false;

            const videoData = {
                startTime: formatTime(startTime),
                endTime: formatTime(endTime),
                duration: duration,
                fileName: fileName,
                fileLocation: fileLocation || 'Undefined',
            };

            let currentData = [];
            if (fs.existsSync(jsonFilePath)) {
                currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            }

            currentData.push(videoData);
            fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');

            console.log(`Recorded: Start Time - ${formatTime(startTime)}, End Time - ${formatTime(endTime)}, Duration - ${duration} seconds, File Name - ${fileName}, File Location - ${fileLocation || 'Undefined'}`);
        }
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
        } else if (error.code === 'ECONNABORTED') {
            console.log('Request timed out:', error.message);
        } else if (error.response) {
            console.log('Server responded with a non-200 status code:', error.message);
        } else if (error.code === 'ECONNREFUSED') {
            console.log('Player is not running.');

            if (videoPlaying) {
                const endTime = new Date();
                const duration = Math.round((endTime - startTime) / 1000);
                videoPlaying = false;

                const videoData = {
                    startTime: formatTime(startTime),
                    endTime: formatTime(endTime),
                    duration: duration,
                    fileName: fileName,
                    fileLocation: fileLocation || 'Undefined',
                };

                let currentData = [];
                if (fs.existsSync(jsonFilePath)) {
                    currentData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
                }

                currentData.push(videoData);
                fs.writeFileSync(jsonFilePath, JSON.stringify(currentData, null, 2), 'utf8');

                console.log(`Recorded: Start Time - ${formatTime(startTime)}, End Time - ${formatTime(endTime)}, Duration - ${duration} seconds, File Name - ${                fileName}, File Location - ${fileLocation || 'Undefined'}`);
            }
        } else {
            console.error('Error:', error.message);
        }
    }
};

const intervalId = setInterval(monitorPlayback, 1000);

