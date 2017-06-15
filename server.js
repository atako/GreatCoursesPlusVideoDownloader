const cheerio = require("cheerio"),
      req = require("tinyreq"),
      curl = require('curlrequest'),
      esprima = require('esprima'),
      https = require('https'),
      fs = require('fs'),
      http = require('http'),
      config = require('./config')


const formatNumber = (digit) => {
    return digit < 9 ? '0' + (digit + 1).toString() : (digit + 1).toString();
}

const loadListOfVideo = (address) => {
    req(address, function (err, body) {
    let $ = cheerio.load(body);
    const comments = $('a.list-tray-item.icon-opacity-container');
    launcher(comments);
    
});
}

const launcher = (comments) => {
    for (var i=0; i < comments.length; i++) {
        console.log(`${formatNumber(i)}-${comments[i].attribs['data-title']} - ${comments[i].attribs['data-film-id']}`);
        getLinkToVideo(comments[i].attribs['data-film-id'], formatNumber(i), comments[i].attribs['data-title']);
    };
}

const getLinkToVideo = (id, number, name) => {
    const requestOptions = { url: `https://www.thegreatcoursesplus.com/embed/player?filmId=${id}`,
                             headers: { Cookie: `${config.user_id}`}};
    curl.request(requestOptions, (err, stdout, meta) => {
        const parsedHTML = cheerio.load(stdout);
        const script1 = parsedHTML('script')[6].children[0].data;
        var arr = /.*9216kbps.*/.exec(script1);
        const ss01 = /"(.*?)"/.exec(arr[0]);
        const link = ss01[0].replace(/['"]+/g, '');
        downloadVideo(link, number, name);
    });
}

const downloadVideo = (link, number, name) => {
    if (link.substr(4,1) === 's') {
        var file = fs.createWriteStream(`${number}-${name}.mp4`);
        var request = https.get(link, function(response) {
            console.log(`Downloading file ${number}`);
            response.pipe(file);
        });
    } else {
        var file = fs.createWriteStream(`${number}-${name}.mp4`);
        var request = http.get(link, function(response) {
            console.log(`Downloading file ${number}`);
            response.pipe(file);
        });
    }
}


loadListOfVideo(config.course_url);

