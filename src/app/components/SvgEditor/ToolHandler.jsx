import React, { useEffect, useState } from 'react';

const ToolManager = () => {
  const [currentTool, setCurrentTool] = useState('SELROJO');
  const [isToolLocked, setIsToolLocked] = useState(false);
  const [domReady, setDomReady] = useState(false);

  // Initialize global state
  useEffect(() => {
    window._evtMsg = {
      busy: false,
      isEditNodes: false,
      waitFor: null,
      isDragScreen: false,
      isDrawSelector: false,
      dragSP: null,
      dragSPsel: null,
      selectorPos: null,
      mousePOS: { x: 0, y: 0 },
      clientX: 0,
      clientY: 0,
      keycode: null,
      jxWork: false,
      selectorShapeSVG: null,
      selectorShapePoints: '',
      selectorShapePointsTT: 0
    };

    window._selector = {
      SELTOOL: 'SELROJO',
      SELTOOLM: null,
      FLAGDRAWSELECTOR: false,
      propSel: []
    };

    window._workSetup = {
      width: 800,
      height: 600,
      guides: false,
      showGuide: 10,
      zeroPos: 99,
      fzoom: null
    };

    window._hnd = {
      svgHandler: null,
      awHandler: null,
      selector: null
    };

    window._ctrlZ = [];
    window.clipboardFill = null;
    window.clipboardBorder = null;
    window.clipboardFilter = null;

    // Set up error handling
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      console.error('Error:', { msg, url, lineNo, columnNo, error });
      return false;
    };

    // Wait for DOM to be fully loaded
    const checkDom = () => {
      const svgHandler = document.querySelector('#svgWorkerArea') || 
                        document.querySelector('#background-wrapper svg');
      const awHandler = document.getElementById('areaWorker') || 
                       document.getElementById('background-wrapper');

      if (svgHandler && awHandler) {
        window._hnd.svgHandler = svgHandler;
        window._hnd.awHandler = awHandler;
        setDomReady(true);
      } else {
        setTimeout(checkDom, 100); // Check again in 100ms
      }
    };

    checkDom();
  }, []);

  // Set up handlers once DOM is ready
  useEffect(() => {
    if (!domReady) return;

    const handleObjectClick = (event) => {
      if (window._evtMsg.busy || window._evtMsg.isEditNodes) return;
      if (window._selector.SELTOOL !== 'SELROJO') return;
      if (window._evtMsg.waitFor !== null) return;

      let eSelected = null;
      const seles = document.getElementsByClassName('selectable').length;

      if (event.target.classList.contains("cosito")) {
        eSelected = event.target;
      } else if (
        event.target.classList.contains("grouped") || 
        event.target.classList.contains("letter") || 
        event.target.tagName === 'path'
      ) {
        eSelected = event.target.closest('.cosito');
      } else if (event.target.closest(".cosito")) {
        eSelected = event.target.closest(".cosito");
      } else if (event.target.classList.contains("subCosito")) {
        const subc = event.target.id;
        eSelected = document.getElementById("tabs-" + subc);
      }

      if (eSelected) {
        const selItems = seles + 1;
        
        if (event.shiftKey) {
          eSelected.classList.add("selectable");
          eSelected.setAttribute("selItem", selItems);
        } else {
          document.querySelectorAll('.cosito.selectable').forEach(element => {
            element.classList.remove("selectable");
            element.setAttribute("selItem", 0);
          });
          
          eSelected.classList.add("selectable");
          eSelected.setAttribute("selItem", 1);
        }
        
        if (typeof window.makeSelection === 'function') {
          window.makeSelection(true);
        }
      } else {
        if (typeof window.noneSelected === 'function') {
          window.noneSelected();
        }
      }
    };

    const setupToolListeners = () => {
      const toolButtons = {
        'btnSelect': 'SELROJO',
        'btnHandLine': 'DRAWHANDLINE',
        'btnPaintBrush': 'PAINTBRUSH',
        'btnRect': 'DRAWSHAPE',
        'btnEllipse': 'DRAWSHAPE',
        'btnPoly': 'DRAWPOLY'
      };

      Object.entries(toolButtons).forEach(([buttonId, toolName]) => {
        const button = document.getElementById(buttonId);
        if (button) {
          const handler = () => {
            if (isToolLocked) return;
            setIsToolLocked(true);
            
            window._selector.SELTOOL = toolName;
            setCurrentTool(toolName);

            document.querySelectorAll("#divLeftMenu .features-item").forEach(btn => {
              btn.classList.remove('sel');
            });
            button.classList.add('sel');

            setTimeout(() => setIsToolLocked(false), 100);
          };

          button.addEventListener('click', handler);
          return () => button.removeEventListener('click', handler);
        }
      });
    };

    // Add click handler to SVG area
    const svgHandler = window._hnd.svgHandler;
    if (svgHandler) {
      svgHandler.addEventListener('click', handleObjectClick);
    }

    // Set up tool buttons
    const cleanup = setupToolListeners();

    return () => {
      if (svgHandler) {
        svgHandler.removeEventListener('click', handleObjectClick);
      }
      if (cleanup) cleanup();
    };
  }, [domReady, isToolLocked]);

  return null;
};

export default ToolManager;