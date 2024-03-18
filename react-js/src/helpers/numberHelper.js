export function toSpaceSeparated(number, round, fractionDigits = 2) {
  let floatNumber = parseFloat(number);
  const options = {
    minimumFractionDigits: fractionDigits,
    maxiFractionDigits: fractionDigits,
  };

  if (round) {
    floatNumber = Math.round(floatNumber);
  }

  if (Number.isNaN(floatNumber)) {
    floatNumber = 0;
  }

  return floatNumber
    .toFixed(fractionDigits)
    .toLocaleString('en-US', options)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,'); // adds comma separator every 3 digits
}
