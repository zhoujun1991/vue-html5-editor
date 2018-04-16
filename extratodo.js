const fs = require('fs');
const path = require('path');

function convert() {
  try {
    let fileBuffer = fs.readFileSync(path.resolve(__dirname, './dist/vue-html5-editor.js'));
    if (!fileBuffer) return;
    let fileStr = fileBuffer.toString();
    fileStr = fileStr.replace('file:t', 'file:e.file/*file:t 修改上传的filename为blob的*/');
    fs.writeFileSync(path.resolve(__dirname, './dist/vue-html5-editor.js'), fileStr);
  } catch (error) {
    console.error(error)
  }
}
convert();