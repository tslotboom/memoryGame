const rSlider = document.getElementById('bg-r');
const gSlider = document.getElementById('bg-g');
const bSlider = document.getElementById('bg-b');
const hexInput = document.getElementById('bg-hex');
export let canvasBackgroundColour = hexInput.value
const quickGameNumbersInput = document.getElementById('quick-game-numbers')
export let quickGameNumNumbers = parseInt(quickGameNumbersInput.value)

function toHex(value) {
  return parseInt(value).toString(16).padStart(2, '0');
}

function updateFromSliders() {
  canvasBackgroundColour = `#${toHex(rSlider.value)}${toHex(gSlider.value)}${toHex(bSlider.value)}`;
  hexInput.value = canvasBackgroundColour;
  // console.log(canvasBackgroundColour, hexInput)
  // document.body.style.backgroundColor = hex;
}

function updateFromHex() {
  const hex = hexInput.value;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return; // wait for valid hex
  rSlider.value = parseInt(hex.slice(1, 3), 16);
  gSlider.value = parseInt(hex.slice(3, 5), 16);
  bSlider.value = parseInt(hex.slice(5, 7), 16);
  // console.log(rSlider.value, gSlider, bSlider)

  // document.body.style.backgroundColor = hex;
}

function updateQuickGameNumbers() {
  quickGameNumNumbers = parseInt(quickGameNumbersInput.value)
  console.log(quickGameNumNumbers)

}


export function initOutsideInput(){
  [rSlider, gSlider, bSlider].forEach(s => s.addEventListener('input', updateFromSliders));
  hexInput.addEventListener('input', updateFromHex);
  quickGameNumbersInput.addEventListener('input', updateQuickGameNumbers)
}
