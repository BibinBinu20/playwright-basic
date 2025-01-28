import * as fs from 'fs';

let data=`"Header","6700","line_level"
 "Line","1","Accept"
 "Line","2","Accept"`.replace(/ /g,"").trim();;

        fs.copyFile('files/templates/supplier_po.csv', 'files/temp/supplier_po.csv', (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
          });
    var logStream = fs.createWriteStream('files/temp/supplier_po.csv', {flags: 'a'});
     logStream.write(data);
     logStream.end();
        //  fs.writeFile('files/temp/supplier_po.csv',data,(err)=>
        //  {
        //     if (err) throw err;
        //     console.log('Successfully written to file');
        //  })       