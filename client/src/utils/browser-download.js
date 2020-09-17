/**
 * download text as file on the browser
 *
 * @param {String} text
 * @param {String} fileName
 */
function download(text = 'empty', fileName = 'file') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const anchor = document.createElement('a');

  anchor.download = fileName;
  anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
  anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
  anchor.click();
}

export default download;
