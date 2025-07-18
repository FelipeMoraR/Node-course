// ANCHOR Recieving a large file and send it to the front
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
    // Solution 1, without streams, load all an send the info
    // fs.readFile('../test-file.txt', (error, data) => {
    //     if(error) console.log(error);
    //     res.end(data);
    // })
    
    // Solution 2, with streams, load the file by chunks
    // const readable = fs.createReadStream('../test-file.txt');
    // // Sending the info by chunks
    // readable.on('data', chunk => {
    //     res.write(chunk);
    // });

    // readable.on('end', () => {
    //     res.end(); // We send the data in the function above, when all the info is send this will close the connection
    // })

    // readable.on('error', err => {
    //     console.log(err);
    //     res.statusCode = 500;
    //     res.end('file not found');
    // })

    // Solution 3. solving backpressure
    const readable = fs.createReadStream('../test-file.txt');
    readable.pipe(res);
    // readbleSource.pipe(writebleDest)
});

server.listen(8000, '127.0.0.1', () => {
    console.log(`Listening on ${8000} port...`);
})
