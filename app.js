(document => {
  document.addEventListener("DOMContentLoaded", () =>
    createDomElelemts(document)
  );
  document.addEventListener(
    "drag",
    function(event) {
      //loopOverTree(event.target);
      // console.log(event.target.getAttribute("data-di-class"));
    },
    false
  );
  let dragged;
  const loopOverTree = el => {
    // if (el.target.children.length) {
    //     let clone = el.cloneNode(false);
    //     el.replaceWith(clone);
    //el.parentElement.appendChild(clone);
    //   }
    // console.log("el", el);
    // console.log("dragged", dragged);

    if (
      !el.children.length &&
      (el.parentNode && el.parentNode.className != "di-body")
    ) {
      let clone = el.cloneNode(true);
      el.replaceWith(clone);
    } else {
      //element has children
      for (let i = 0; i < el.children.length; i++) {
        // let clone = el.cloneNode(true);
        // el.replaceWith(clone);

        loopOverTree(el.children[i]);
      }
    }
  };
  const loopOverTreeEvents = el => {
    if (
      !el.children.length &&
      (el.parentNode && el.parentNode.className != "di-body")
    ) {
      el.addEventListener("drag", drag, false);
      el.addEventListener("dragend", dragend, false);
      el.addEventListener("dragenter", dragenter, false);
      el.addEventListener("dragexit", dragexit, false);
      el.addEventListener("dragleave", dragleave, false);
      el.addEventListener("dragover", dragover, false);
      el.addEventListener("dragstart", dragstart, false);
      el.addEventListener("drop", drop, false);
    } else {
      //element has children
      for (let i = 0; i < el.children.length; i++) {
        loopOverTree(el.children[i]);
      }
    }
  };
  const dragstart = event => {
    //console.log("dragstart");
    dragged = event.target;
  };
  const dragover = event => {
    //  console.log("dragover");
    event.preventDefault();
    event.stopPropagation();
    //loopOverTree(event.target);

    //console.log("dragover", event.target);
  };
  const dragenter = event => {
    //console.log("dragenter");
    // console.log(event.target);
    //event.dataTransfer.dropEffect = "copy";
    if (dragged == event.target) {
      return;
    }
    event.target.style.border = "2px solid black";
  };
  //   div.addEventListener("drop", drop, false);
  //   div.addEventListener("dragleave", dragleave, false);
  //   div.addEventListener("dragenter", dragenter, false);
  //   div.addEventListener("dragover", dragover, false);
  //   div.addEventListener("dragstart", dragstart, false);

  const dragleave = event => {
    // console.log("dragleave");
    event.target.style.border = "1px solid black";
  };
  const drag = event => {
    // console.log("drag");
  };
  const dragend = event => {
    //console.log("dragend");
    //loopOverTreeEvents(event.target);
  };
  const dragexit = event => {
    //console.log("dragexit");
  };

  const drop = event => {
    //console.log("drop");
    event.preventDefault();
    event.stopPropagation();
    if (dragged == event.target) return;
    // move dragged elem to the selected drop target
    //   dragged.parentNode.removeChild(dragged);
    //   event.target.appendChild(dragged);
    //swapElements(dragged, event.target);
  };

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

  const generateClassName = () => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    if (elementClassMapper[text]) {
      generateClassName();
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

  const swapElements = (el1, el2) => {
    // save the location of obj2
    var parent2 = el2.parentNode;
    var next2 = el2.nextSibling;
    // special case for el1 is the next sibling of el2
    if (next2 === el1) {
      // just put el1 before el2
      parent2.insertBefore(el1, el2);
    } else {
      // insert el2 right before obj1
      el1.parentNode.insertBefore(el2, el1);

      // now insert el1 where el2 was
      if (next2) {
        // if there was an element after el2, then insert el1 right before that
        parent2.insertBefore(el1, next2);
      } else {
        // otherwise, just append as last child
        parent2.appendChild(el1);
      }
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
    //console.log(e);
    // These are the default actions (the XPath code might be a bit janky)
    // Really, these could do anything:
    //console.log(cssPath(e.target));
    /* console.log( getXPath(e.target).join('/') ); */

    //return false;
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
    div.style.margin = "10px";
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
    div.addEventListener("drag", drag, false);
    div.addEventListener("dragend", dragend, false);
    div.addEventListener("dragenter", dragenter, false);
    div.addEventListener("dragexit", dragexit, false);
    div.addEventListener("dragleave", dragleave, false);
    div.addEventListener("dragover", dragover, false);
    div.addEventListener("dragstart", dragstart, false);
    div.addEventListener("drop", drop, false);

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
