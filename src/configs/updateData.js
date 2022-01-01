import request from 'request';
const fs = require("fs")

let updateData = async() => {
    let fonts = 'http://localhost:8080/api/v1/fonts';
    return new Promise((reslove, reject) => {
        request.get(fonts, function(error, response, body) {
            var fontObject = JSON.parse(body).font;
            var dataObject = JSON.parse(body).data;
            var listfontObject = JSON.parse(body).listfont;
            var fontFile = fs.createWriteStream('font.json');
            var dataFile = fs.createWriteStream('data.json');
            var dataFile = fs.createWriteStream('listfont.json');
            try {
                fs.writeFileSync('font.json', JSON.stringify(fontObject));
                console.log("Lưu danh sách font thành công.");
                fs.writeFileSync('data.json', JSON.stringify(dataObject));
                console.log("Lưu danh sách font thành công.");
                fs.writeFileSync('listfont.json', JSON.stringify(listfontObject));
                console.log("Lưu danh sách font thành công.");
                fs.writeFileSync("checkUpdate.txt", 'True');
            } catch (error) {
                console.error(err);
            }
            reslove('sdf');

        });


    })
}
export default updateData;