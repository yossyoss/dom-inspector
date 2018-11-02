(function(document) {
  document.addEventListener("DOMContentLoaded", () =>
    makeDomElelemts(document)
  );
  const elementToColorMapper = {};

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
  //recursive method the returns an object that represent the dom tree
  const getNodeTree = node => {
    if (node.hasChildNodes()) {
      const children = [];
      for (let j = 0; j < node.childNodes.length; j++) {
        if (getNodeTree(node.childNodes[j])) {
          children.push(getNodeTree(node.childNodes[j]));
        }
      }

      return {
        nodeName: node.nodeName,
        node: node,
        parentName: node.parentNode.nodeName,
        parent: node.parentNode,
        color: getColor(node.nodeName),
        children: children
      };
    }

    return false;
  };
  //to-do : make this and createDomInspectorWrapper one generic method
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

  const createDomInspectoBody = bodyEl => {
    let diClass = document.querySelector(".di-container");
    let newEl = createSingleBox(bodyEl[0]);
    newEl.classList.add("di-body");
    newEl.style.display = "flex";
    newEl.style.border = "1px solid black";
    diClass.appendChild(newEl);
  };

  const createSingleBox = el => {
    const div = document.createElement("div");
    div.innerHTML = el.nodeName;
    div.style.margin = "10px";
    div.style.padding = "10px";
    div.style.border = "1px solid black";
    div.style.background = el.color;
    div.style.display = "flex";
    return div;
  };

  const createDomInspectorContent = bodyEl => {
    createDomInspectoBody(bodyEl);
    let diClass = document.querySelector(".di-body");
    let newArr = bodyEl[0].children;
    for (let i = 0; i < newArr.length; i++) {
      const element = newArr[i];
      if (element.children.length > 0) {
        createDomInspectorRecursively(element);
      } else {
        newEl = createSingleBox(element);
        newEl.style.width = "15px";
        newEl.style.height = "15px";
        diClass.appendChild(newEl);
      }
    }
  };

  function createDomInspectorRecursively(element, diClass) {
    let newEl;
    if (element.parentName.toLowerCase() == "body") {
      diClass = document.querySelector(".di-body");
    }
    if (!element.children.length) {
      newEl = createSingleBox(element);
      newEl.style.maxWidth = "15px";
      newEl.style.maxHeight = "15px";
      diClass.appendChild(newEl);
    } else {
      //element has children
      newEl = createSingleBox(element);
      if (".di-body" != diClass.className) newEl.style.flexWrap = "wrap"; //this line is only for responsive matters
      diClass.appendChild(newEl);
      diClass = newEl;
      for (let i = 0; i < element.children.length; i++) {
        createDomInspectorRecursively(element.children[i], diClass);
      }
    }
  }

  //Here the magic happen
  const makeDomElelemts = document => {
    let bodyEl;
    try {
      bodyEl = document.getElementsByTagName("body")[0];
    } catch (e) {
      throw new Error("Not a valid html");
    }
    if (bodyEl) {
      let bodyTree = [getNodeTree(bodyEl)];
      console.log(bodyTree);
      createDomInspectorContainer();
      createDomInspectorContent(bodyTree);
    }
  };
})(document);
