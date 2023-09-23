const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 7001;
let trends = [];//масив для збереження трендів
//створення серверу
const server = http.createServer((req, res) => {
  //обробка GET 
  if (req.method === 'GET') {
    switch (req.url) {
      case '/':
        case '/home': {
            res.statusCode = 200;
            fs.readFile(
              path.join(__dirname, "Views", "index.html"),
              "utf-8",
              (err, content) => {
                if (err) {
                  throw err;
                }
                res.end(content);
              }
            );
            break}
        case '/chart': {
                res.statusCode = 200;
                fs.readFile(
                  path.join(__dirname, "Views", "chart.html"),
                  "utf-8",
                  (err, content) => {
                    if (err) {
                      throw err;
                    }
                    res.end(content);
                  }
                );
                break}         
          case '/gettrend': {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/json; charset=utf-8');        
                    res.end (gettrenddata (trends));
                    //console.log (gettrenddata (trends));
                  break}
          
       
      default: {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
        res.end('Не знайдено\n');
        break}}}
     //обробка POST
     if (req.method === 'POST') {
        const body = [];
        res.statusCode = 200;
        req.on("data", (data) => {
          body.push(data);
        });
        req.on("end", () => {
            //console.log (JSON.parse(body.toString()));
            trends = trends.concat (JSON.parse(body.toString()));
            console.log (`Записів тренду в масиві ${trends.length}, останній запис ${(JSON.stringify(trends[trends.length-1]))}`); 
            if (trends.length >= 3600) {
              let fname = trends[0].ts;
              //запис в файл значень за годину
              fs.writeFileSync(fname + '.log', JSON.stringify(trends), 'utf8');
              trends = [];
            } 
            res.end();
        });            
      } 
  
})  
//запуск прослуховуваня

server.listen(port, () => {
  console.log(`Server listens http://127.0.0.1:7001`)
})

function gettrenddata (trdata, dtstart = Date.now() - 1*60*1000, dtend = Date.now()){
    let ret = [['Час', 'Температура на вулиці', 'Температура в домі', 'Волога в домі']];
    for (let i=0; i < trdata.length; i++) {
      if (trdata[i].ts>dtend) break; 
      if (trdata[i].ts>dtstart) {
        let ts = new Date (trdata[i].ts);
        stime = '' + ts.getHours() + ':' + ts.getMinutes() + ':' + ts.getSeconds(); 
         let rec = [stime, trdata[i].temp_in, trdata[i].temp_dom, trdata[i].volog_dom ]; 
         ret.push (rec); 
      }  
    }
    return JSON.stringify(ret);
  }
