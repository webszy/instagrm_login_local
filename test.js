const rp = require('request-promise')
const requestOptions = {
  json: true,
  resolveWithFullResponse: false,
  // proxy: 'http://127.0.0.1:7890',
  headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
    'content-type': 'application/json; charset=utf-8',
    'referer': 'https://www.instagram.com/',
    'origin': 'https://www.instagram.com/'
  }
}
rp.get('https://www.instagram.com/p/B6uz13ZA2fi/?__a=1',requestOptions)
  .then(response=>{
    console.log('response', response)
  })
  .catch(()=>{
   
  })
