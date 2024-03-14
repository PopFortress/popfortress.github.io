import createRequestWithTimeout from './lib-request-with-timeout.mjs';

const body = document.querySelector('body');
const requestEngine = createRequestWithTimeout(10000);

requestEngine("https://api.vvhan.com/api/bing?rand=sj")
    .then(response => {
        return response;
    })
    .then(data => {
        console.log(data);
    })
    .catch(() => {
        body.style.backgroundImage = 'var(--slow-daily)';
    });