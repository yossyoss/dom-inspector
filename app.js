(document => {
  document.addEventListener("DOMContentLoaded", () =>
    createDomInspector(document)
  );

  let dragged;
  const elementToColorMapper = {},
    elementClassMapper = {};

  const isElementValidForDropping = e => {
    while (e) {
      if (e === dragged) return false;
      // Go up to the next parent node:
      e =
        e.parentNode !== document.querySelector(".di-body")
          ? e.parentNode
          : false;
    }
    return true;
  };

  const checkDropPosition = (event, el) => {
    const shiftX = event.clientX - el.getBoundingClientRect().left;
    const elementWidth = el.getBoundingClientRect().width;
    if (shiftX > 10 && elementWidth - shiftX > 10) {
      return "center";
    } else if (shiftX < 10) {
      return "left";
    } else if (elementWidth - shiftX < 10) {
      return "right";
    }
  };
  const dragover = event => {
    event.preventDefault();
    let e = event.target;
    if (isElementValidForDropping(e)) {
      const dropPosition = checkDropPosition(event, e);
      if (dropPosition === "center") {
        e.style.border = "4px solid black";
      } else if (dropPosition === "left") {
        e.style.border = "1px solid black";
        e.style.borderLeft = "4px solid black";
      } else if (dropPosition === "right") {
        e.style.border = "1px solid black";
        e.style.borderRight = "4px solid black";
      }
    }
  };

  const dragstart = event => {
    event.stopPropagation();
    dragged = event.target; //save the dragged element for future use
  };

  const dragleave = event => {
    const e = event.target;
    e.style.border = "1px solid black";
  };

  const drop = event => {
    event.preventDefault();
    event.stopPropagation();
    const e = event.target;
    e.style.border = "1px solid black";
    const dropPosition = checkDropPosition(event, e);
    if (isElementValidForDropping(e))
      swapElements(dragged, event.target, dropPosition);
  };

  const swapElements = (source, target, dragInto) => {
    // save the location of el2
    const parentTarget = target.parentNode;
    const nextTarget = target.nextSibling;
    const correspondingDomSrc = getCorrespondingDomEl(null, source);
    const correspondingDomTarget = getCorrespondingDomEl(null, target);
    if (dragInto === "center") {
      target.appendChild(source);
      correspondingDomTarget.appendChild(correspondingDomSrc);
    } else if (dragInto === "left") {
      parentTarget.insertBefore(source, target);
      correspondingDomTarget.parentNode.insertBefore(
        correspondingDomSrc,
        correspondingDomTarget
      );
    } else {
      parentTarget.insertBefore(source, nextTarget);
      correspondingDomTarget.parentNode.insertBefore(
        correspondingDomSrc,
        correspondingDomTarget.nextSibling
      );
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getColor = nodeName => {
    if (elementToColorMapper[nodeName]) {
      return elementToColorMapper[nodeName];
    }
    elementToColorMapper[nodeName] = getRandomColor();
    return elementToColorMapper[nodeName];
  };

  const generateClassName = () => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    if (elementClassMapper[text]) {
      generateClassName();
    } else {
      elementClassMapper[text] = true;
      return text;
    }
  };

  const getCorrespondingDomEl = (event, elm) => {
    const element = event ? event.target : elm;
    const className = element.getAttribute("data-di-class");
    return document.querySelector(`.${className}`);
  };

  // This is a function that I took from here https://css-tricks.com/snippets/javascript/lighten-darken-color/
  // It takes colors in hex format (i.e. #F06D06, with or without hash) and lightens or darkens them with a value
  const getLightenOrDarkenColor = (colorCode, amount) => {
    let usePound = false;
    if (colorCode[0] === "#") {
      colorCode = colorCode.slice(1);
      usePound = true;
    }
    let num = parseInt(colorCode, 16);
    let r = (num >> 16) + amount;
    if (r > 255) {
      r = 255;
    } else if (r < 0) {
      r = 0;
    }
    let b = ((num >> 8) & 0x00ff) + amount;
    if (b > 255) {
      b = 255;
    } else if (b < 0) {
      b = 0;
    }
    let g = (num & 0x0000ff) + amount;
    if (g > 255) {
      g = 255;
    } else if (g < 0) {
      g = 0;
    }
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  };

  //This function handle the highlights of the corresponding element
  const highlightParent = e => {
    let Lighter = 0;
    const elementsTree = [];
    while (e) {
      elementsTree.unshift(e);
      // Go up to the next parent node:
      e = e.parentNode !== document ? e.parentNode : false;
    }
    elementsTree.forEach(el => {
      el.style.background = getLightenOrDarkenColor("#9eff9e", Lighter);
      Lighter -= 20;
    });
  };

  const inspectorMouseOver = e => {
    e.stopPropagation();
    const correspondingDomEl = getCorrespondingDomEl(e);
    highlightParent(correspondingDomEl);
  };

  const inspectorMouseOut = e => {
    e.stopPropagation();
    let correspondingDomEl = getCorrespondingDomEl(e);
    correspondingDomEl.style.background = "none";
    while (correspondingDomEl) {
      correspondingDomEl.style.background = "none";
      correspondingDomEl =
        correspondingDomEl.parentNode !== document
          ? correspondingDomEl.parentNode
          : false;
    }
  };

  //This recursive function returns an object that represent the dom tree
  //(and also generate a unic classname in order to match dom inspector element with his corresponding dom node)
  const getNodeTree = node => {
    let unicClassName = generateClassName();
    if (node.hasChildNodes()) {
      const children = [];
      node.childNodes.forEach(n => {
        if (getNodeTree(n)) {
          children.push(getNodeTree(n));
        }
      });
      node.classList.add(`di-${unicClassName}`);
      return {
        nodeName: node.nodeName,
        className: unicClassName,
        parentName: node.parentNode.nodeName,
        color: getColor(node.nodeName),
        children: children
      };
    }
    return null;
  };

  //This function creates new element in the dom inspector
  const createSingleBox = el => {
    const div = document.createElement("div");
    div.innerHTML = el.nodeName;
    div.style.background = el.color;
    div.style.margin = "5px";
    div.style.cursor = "-webkit-grab";
    div.style.padding = "10px";
    div.style.border = "1px solid black";
    div.style.maxWidth = "fit-content";
    div.style.maxHeight = "fit-content";
    div.setAttribute("draggable", "true");
    div.setAttribute("data-di-class", `di-${el.className}`);
    if (el.nodeName.toLowerCase() === "body") {
      div.classList.add("di-body");
      div.setAttribute("draggable", "false");
      div.style.minHeight = "200px";
    }
    //adding drag/drop events
    div.addEventListener("dragstart", dragstart);
    div.addEventListener("dragover", dragover);
    div.addEventListener("dragleave", dragleave);
    div.addEventListener("drop", drop);
    //adding mouse events
    div.addEventListener("mouseover", inspectorMouseOver);
    div.addEventListener("mouseout", inspectorMouseOut);
    return div;
  };

  //creating a grey container to put the dom inspecter in it
  const createDomInspectorContainer = () => {
    const container = document.createElement("container");
    container.classList.add("di-container");
    container.style.background = "lightgray";
    container.style.width = "100%";
    container.style.height = "300px";
    container.style.fontSize = "x-small";
    container.style.display = "flex";
    container.style.boxShadow = "0 -1px 1px grey";
    document.body.appendChild(container);
  };

  const createDomInspectorContentRecursively = (element, parentEl) => {
    let newEl;
    if (element.parentName && element.parentName.toLowerCase() === "body") {
      parentEl = document.querySelector(".di-body");
    }
    if (element.parentName && element.parentName.toLowerCase() === "html") {
      parentEl = document.querySelector(".di-container");
    }
    if (!element.children.length) {
      newEl = createSingleBox(element);
      parentEl.appendChild(newEl);
    } else {
      //element has children
      newEl = createSingleBox(element);
      newEl.style.display = "flex";
      if (".di-body" != parentEl.className) newEl.style.flexWrap = "wrap"; //this line is only for responsive matters
      parentEl.appendChild(newEl);
      parentEl = newEl;
      element.children.forEach(el => {
        createDomInspectorContentRecursively(el, parentEl);
      });
    }
  };

  const createDomInspectorElelemts = bodyEl => {
    createDomInspectorContainer();
    createDomInspectorContentRecursively(bodyEl);
  };

  //Here the magic happens
  const createDomInspector = document => {
    try {
      let bodyTree = getNodeTree(document.body);
      createDomInspectorElelemts(bodyTree);
    } catch (e) {
      console.error("Not a valid HTML");
    }
  };
})(document);
