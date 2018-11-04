(document => {
  document.addEventListener("DOMContentLoaded", () =>
    createDomElelemts(document)
  );

  let dragged;
  const elementToColorMapper = {},
    elementClassMapper = {};

  const isElementValidForDropping = e => {
    while (e) {
      if (e == dragged) return false;
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
    let e = event.target;
    if (isElementValidForDropping(e)) {
      event.preventDefault();
      const dropPosition = checkDropPosition(event, e);
      if (dropPosition === "center") {
        e.style.border = "3px solid black";
      } else if (dropPosition === "left") {
        e.style.border = "1px solid black";
        e.style.borderLeft = "3px solid black";
      } else if (dropPosition === "right") {
        e.style.border = "1px solid black";
        e.style.borderRight = "3px solid black";
      }
    }

    //console.log("X: " + dragX + " Y: " + dragY);
  };

  const dragstart = event => {
    event.stopPropagation();
    dragged = event.target;
  };

  const dragleave = event => {
    event.target.style.border = "1px solid black";
  };

  const drop = event => {
    event.preventDefault();
    event.stopPropagation();
    event.target.style.border = "1px solid black";
    const e = event.target;
    const dropPosition = checkDropPosition(event, e);
    swapElements(dragged, event.target, dropPosition);
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
    //console.log(element);
    const className = element.getAttribute("data-di-class");
    return document.querySelector(`.${className}`);
  };

  const swapElements = (el1, el2, dragInto) => {
    // save the location of el2
    const parent2 = el2.parentNode;
    const next2 = el2.nextSibling;
    const correspondingDomEl1 = getCorrespondingDomEl(null, el1);
    const correspondingDomEl2 = getCorrespondingDomEl(null, el2);
    if (dragInto === "center") {
      el2.appendChild(el1);
      correspondingDomEl2.appendChild(correspondingDomEl1);
    } else if (dragInto === "left") {
      parent2.insertBefore(el1, el2);
      correspondingDomEl2.parentNode.insertBefore(
        correspondingDomEl1,
        correspondingDomEl2
      );
    } else {
      parent2.insertBefore(el1, next2);
      correspondingDomEl2.parentNode.insertBefore(
        correspondingDomEl1,
        correspondingDomEl2.nextSibling
      );
    }
  };

  // This is a function that I took from here https://css-tricks.com/snippets/javascript/lighten-darken-color/
  // It takes colors in hex format (i.e. #F06D06, with or without hash) and lightens or darkens them with a value
  const getLightenOrDarkenColor = (colorCode, amount) => {
    let usePound = false;
    if (colorCode[0] == "#") {
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
    let correspondingDomEl = getCorrespondingDomEl(e);
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

  const inspectorOnClick = e => {
    e.stopPropagation();
  };

  //recursive method the returns an object that represent the dom tree
  const getNodeTree = node => {
    let unicClassName = generateClassName();
    if (node.hasChildNodes()) {
      const children = [];
      for (let j = 0; j < node.childNodes.length; j++) {
        if (getNodeTree(node.childNodes[j])) {
          children.push(getNodeTree(node.childNodes[j]));
        }
      }
      node.classList.add(`di-${unicClassName}`);
      return {
        nodeName: node.nodeName,
        node: node,
        className: unicClassName,
        parentName: node.parentNode.nodeName,
        parent: node.parentNode,
        color: getColor(node.nodeName),
        children: children
      };
    }
    return false;
  };

  const createDomInspectorContainer = () => {
    const container = document.createElement("container");
    container.classList.add("di-container");
    container.style.background = "lightgray";
    container.style.width = "100%";
    container.style.height = "300px";
    container.style.fontSize = "x-small";
    container.style.border = "1px solid black";
    container.style.display = "flex";
    document.body.appendChild(container);
  };

  const createSingleBox = el => {
    const div = document.createElement("div");
    div.innerHTML = el.nodeName;
    div.style.background = el.color;
    div.style.margin = "5px";
    div.style.cursor = "-webkit-grab";
    div.style.padding = "10px";
    div.style.border = "1px solid black";
    div.style.display = "flex";
    div.setAttribute("draggable", "true");
    div.setAttribute("data-di-class", `di-${el.className}`);
    if (el.nodeName.toLowerCase() === "body") {
      div.classList.add("di-body");
      div.setAttribute("draggable", "false");
    }
    div.addEventListener("dragover", dragover, false);
    div.addEventListener("dragleave", dragleave, false);

    div.addEventListener("dragstart", dragstart, false);
    div.addEventListener("drop", drop, false);

    div.addEventListener("mouseover", inspectorMouseOver, true);
    div.addEventListener("mouseout", inspectorMouseOut, false);
    div.addEventListener("click", inspectorOnClick, false);

    return div;
  };

  const createDomInspector = bodyEl => {
    createDomInspectorContainer();
    createDomInspectorRecursively(bodyEl);
  };

  const createDomInspectorRecursively = (element, parentEl) => {
    let newEl;
    if (element.parentName.toLowerCase() == "body") {
      parentEl = document.querySelector(".di-body");
    }
    if (element.parentName.toLowerCase() == "html") {
      parentEl = document.querySelector(".di-container");
    }
    if (!element.children.length) {
      newEl = createSingleBox(element);
      newEl.addEventListener("click", inspectorOnClick, false);
      newEl.style.maxWidth = "10px";
      newEl.style.maxHeight = "10px";
      parentEl.appendChild(newEl);
    } else {
      //element has children
      newEl = createSingleBox(element);
      //if (".di-body" != parentEl.className) newEl.style.flexWrap = "wrap"; //this line is only for responsive matters
      parentEl.appendChild(newEl);
      parentEl = newEl;
      for (let i = 0; i < element.children.length; i++) {
        createDomInspectorRecursively(element.children[i], parentEl);
      }
    }
  };

  //Here the magic happen
  const createDomElelemts = document => {
    let bodyEl;
    try {
      bodyEl = document.getElementsByTagName("body")[0];
    } catch (e) {
      throw new Error("Not a valid html");
    }
    let bodyTree = getNodeTree(bodyEl);
    console.log(bodyTree);
    createDomInspector(bodyTree);
  };
})(document);
