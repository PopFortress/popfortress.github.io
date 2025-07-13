import createRequestWithTimeout from "/static/lib-request-with-timeout.mjs";
const request = createRequestWithTimeout(5000);
request('https://api.vvhan.com/api/bing')
   .then(response => {
        return response;
   })
   .then(data => {
        console.log(data);
   })
   .catch(() => {
        document.documentElement.style.backgroundImage = "var(--bg-api-lime)";
   });