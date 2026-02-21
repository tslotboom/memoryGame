export const mouse = {
  x: 0,
  y: 0,
  isDown: false
};

// Get mouse position relative to canvas
function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Initialize mouse events on a canvas - call once
export function initMouse(canvas, interactiveObjects) {
  canvas.addEventListener('mousemove', (e) => {
    const pos = getMousePos(canvas, e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    for (let object of interactiveObjects) {
      console.log(object)
      if (!object.disabled){
        object.setIsHovered(mouse)
      }
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    mouse.isDown = true;
  });

  canvas.addEventListener('mouseup', (e) => {
    mouse.isDown = false;
  });

  // Handle mouseup outside canvas (e.g. drag off)
  window.addEventListener('mouseup', () => {
    mouse.isDown = false;
  });


  canvas.addEventListener('click', (e) => {
    for (let object of interactiveObjects) {
      if (object.isHovered) {
        object.handleClick()
      }
    }
  })
}