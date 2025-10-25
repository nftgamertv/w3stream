export function createColorPicker() {
    const container = document.createElement('div');
    container.id = 'svg-color-picker';
    container.style.position = 'fixed'; 
    container.style.backgroundColor = '#18202f';
    container.style.display = 'flex'; 
    container.style.flexDirection = 'row';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
container.style.height = '72px';
container.style.width = '150px';


    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    container.style.zIndex = '9999';
  
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.width = '50px';
    colorInput.style.height = '50px';
  
    const applyButton = document.createElement('button');
    applyButton.textContent = 'apply';
    applyButton.style.position = 'relative'
    applyButton.style.bottom = '14px';
    applyButton.style.left = '10px';
    applyButton.style.textTransform = 'uppercase';
    applyButton.style.padding = '5px 10px';
    applyButton.style.backgroundColor = '#3e12c9';
    applyButton.style.borderRadius = '5px';
    container.appendChild(colorInput);
    container.appendChild(applyButton);
  
    let currentCallback = null;
  
    function show(x, y, currentColor, callback) {
      container.style.display = 'block';
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
  
      // Convert 'none' to a default color and handle missing color case
      let initialColor = currentColor;
      if (!initialColor || initialColor === 'none') {
        initialColor = '#000000';
      } else if (initialColor.startsWith('rgb')) {
        // Convert RGB to hex if needed
        const rgb = initialColor.match(/\d+/g);
        if (rgb) {
          initialColor = '#' + rgb.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        }
      }
  
      colorInput.value = initialColor;
      currentCallback = callback;
    }
  
    function hide() {
      container.style.display = 'none';
      currentCallback = null;
    }
  
    applyButton.addEventListener('click', () => {
      if (currentCallback) {
        currentCallback(colorInput.value);
      }
      hide();
    });
  
    document.body.appendChild(container);
  
    document.addEventListener('click', (e) => {
      if (container.style.display === 'block' && !container.contains(e.target as Node)) {
        hide();
      }
    });
  
    return {
      container,
      show,
      hide,
    };
  }