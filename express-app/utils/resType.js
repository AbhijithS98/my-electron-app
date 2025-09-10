
//content type detection
function getResponseType(contentType = "") {
  const ct = contentType.toLowerCase();
  
  if (ct.includes('json')) return 'json';
  if (ct.includes('csv') || ct.includes('text/csv')) return 'csv';
  if (ct.includes('zip') || ct.includes('application/zip')) return 'zip';
  
  return 'text';
}

module.exports = getResponseType;