(document => {
  document.addEventListener("DOMContentLoaded", () =>
    createDomElelemts(document)
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
    return div;
  };

  const createDomInspectoBody = bodyEl => {
    let diContainer = document.querySelector(".di-container");
    let newEl = createSingleBox(bodyEl[0]);
    newEl.classList.add("di-body");
    diContainer.appendChild(newEl);
  };

  const createDomInspector = bodyEl => {
    createDomInspectorContainer();
    createDomInspectoBody(bodyEl);
    let parentEl = document.querySelector(".di-body");
    let bodyChildren = bodyEl[0].children;
    for (let i = 0; i < bodyChildren.length; i++) {
      const element = bodyChildren[i];
      if (element.children.length > 0) {
        createDomInspectorRecursively(element);
      } else {
        newEl = createSingleBox(element);
        newEl.style.width = "15px";
        newEl.style.height = "15px";
        parentEl.appendChild(newEl);
      }
    }
  };

  function createDomInspectorRecursively(element, parentEl) {
    let newEl;
    if (element.parentName.toLowerCase() == "body") {
      parentEl = document.querySelector(".di-body");
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
    let bodyTree = [getNodeTree(bodyEl)];
    console.log(bodyTree);
    createDomInspector(bodyTree);
  };
})(document);
