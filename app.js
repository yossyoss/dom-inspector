(document => {
  document.addEventListener("DOMContentLoaded", () =>
    createDomElelemts(document)
  );

  const elementToColorMapper = {},
    elementClassMapper = {};

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

  const generateClass = () => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    if (elementClassMapper[text]) {
      generateClass();
    } else {
      elementClassMapper[text] = true;
      return text;
    }
  };

  const getCorrespondingDomEl = e => {
    const element = e.target;
    //console.log(element);
    const className = element.getAttribute("data-di-class");
    return document.querySelector(`.${className}`);
  };

  // This is an helper function that I took from here https://css-tricks.com/snippets/javascript/lighten-darken-color/
  // This function takes colors in hex format (i.e. #F06D06, with or without hash) and lightens or darkens them with a value
  const getDarkenColor = (colorCode, amount) => {
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
    let darker = 20;
    e.style.background = "#86ff86";
    e = e.parentNode !== document ? e.parentNode : false;
    while (e) {
      darker += 20;
      e.style.background = getDarkenColor("#86ff86", darker);
      // Go up to the next parent node:
      e = e.parentNode !== document ? e.parentNode : false;
    }
  };

  const inspectorMouseOver = e => {
    let correspondingDomEl = getCorrespondingDomEl(e);
    highlightParent(correspondingDomEl);
  };

  const inspectorMouseOut = e => {
    let correspondingDomEl = getCorrespondingDomEl(e);
    correspondingDomEl.style.background = "none";
  };

  const inspectorOnClick = e => {
    e.preventDefault();
    //console.log(e);
    // These are the default actions (the XPath code might be a bit janky)
    // Really, these could do anything:
    //console.log(cssPath(e.target));
    /* console.log( getXPath(e.target).join('/') ); */

    //return false;
  };

  //recursive method the returns an object that represent the dom tree
  const getNodeTree = node => {
    let unicClassName = generateClass();
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
    div.style.margin = "10px";
    div.style.cursor = "-webkit-grab";
    div.style.padding = "10px";
    div.style.border = "1px solid black";
    div.style.display = "flex";
    div.setAttribute("draggable", "true");
    div.setAttribute("data-di-class", `di-${el.className}`);
    if (el.nodeName.toLowerCase() === "body") div.classList.add("di-body");
    div.addEventListener("mouseover", inspectorMouseOver, false);
    div.addEventListener("mouseout", inspectorMouseOut, false);
    div.addEventListener("click", inspectorOnClick, false);
    return div;
  };

  const createDomInspector = bodyEl => {
    createDomInspectorContainer();
    createDomInspectorRecursively(bodyEl);
  };

  function createDomInspectorRecursively(element, parentEl) {
    let newEl;
    if (element.parentName.toLowerCase() == "body") {
      parentEl = document.querySelector(".di-body");
    }
    if (element.parentName.toLowerCase() == "html") {
      parentEl = document.querySelector(".di-container");
    }
    if (!element.children.length) {
      newEl = createSingleBox(element);
      newEl.style.maxWidth = "15px";
      newEl.style.maxHeight = "15px";
      parentEl.appendChild(newEl);
    } else {
      //element has children
      newEl = createSingleBox(element);
      if (".di-body" != parentEl.className) newEl.style.flexWrap = "wrap"; //this line is only for responsive matters
      parentEl.appendChild(newEl);
      parentEl = newEl;
      for (let i = 0; i < element.children.length; i++) {
        createDomInspectorRecursively(element.children[i], parentEl);
      }
    }
  }

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
