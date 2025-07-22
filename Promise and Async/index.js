const superagent = require('superagent');
const fs = require('fs');

// NOTE Callback hell
// superagent
//     .get('https://dog.ceo/api/breeds/image/random')
//     .end((err, res) => {
//         if (err) return console.log(err.message);
//         console.log(res.body.message);

//         fs.writeFile('dog-img.txt', res.body.message, err => {
//             if (err) return console.log(err.message);
//             console.log('RANDOM DOG IMG CREATED');
//         });
//     });

// NOTE Promise
const writeFilePro = (fileName, fileData) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, fileData, err => {
            if (err) reject(err.message);
            resolve('success');
        })
    })
}

superagent
    .get('https://dog.ceo/api/breeds/image/random')
    .then(data => {
        console.log(data.body.message);
        return writeFilePro('dog-img.txt', data.body.message);
    })
    .then(() => {
        console.log('Random dog image created');
    })
    .catch(err => {
        console.log(err.message);
    })

// NOTE Async 
const getDogPic = async () => {
    try {
        const data = await superagent.get('https://dog.ceo/api/breeds/image/random');
        console.log(data.body.message);
        await writeFilePro('dog-img.txt', data.body.message);
        console.log('Random dog image created');
    } catch (err) {
        console.log(err);
    }
}

getDogPic();