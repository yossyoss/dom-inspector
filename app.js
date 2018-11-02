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
    container.style.padding = "20px";
    //container.style.height = "300px";
    container.style.display = "flex";
    document.body.appendChild(container);
  };

  //   const createDomInspectorWrapper = () => {
  //     const div = document.createElement("div");
  //     div.classList.add("di-wrapper");
  //     div.innerHTML = "body";
  //     div.style.minWidth = "30px";
  //     div.style.minHeight = "30px";
  //     div.style.background = "#dc8f8f";
  //     div.style.display = "flex";
  //     div.style.padding = "10px";
  //     const diContainer = document.querySelector(".di-container");
  //     diContainer.appendChild(div);
  //   };

  const createSingleElementBox = el => {
    //console.log(el);

    const div = document.createElement("div");
    div.innerHTML = el.nodeName;
    div.style.minWidth = "30px";
    div.style.minHeight = "30px";
    div.style.margin = "10px";
    div.style.padding = "10px";
    div.style.background = el.color;
    return div;
  };

  const createSingleElementBox2 = arr => {
    let i = 0;
    let diClass = document.querySelector(".di-container");
    let newEl = createSingleElementBox(arr[0]);
    newEl.classList.add("di-body");
    newEl.style.display = "flex";
    diClass.appendChild(newEl);
    diClass = document.querySelector(".di-body");
    let newArr = arr[0].children;
    for (let i = 0; i < newArr.length; i++) {
      const element = newArr[i];
      if (element.children.length > 0) {
        rec(element);
      } else {
        newEl = createSingleElementBox(element);
        diClass.appendChild(newEl);
      }
    }
  };

  function rec(element, diClass) {
    let newEl;
    if (element.parentName.toLowerCase() == "body") {
      diClass = document.querySelector(".di-body");
    }
    if (!element.children.length) {
      newEl = createSingleElementBox(element);
      diClass.appendChild(newEl);
    } else {
      newEl = createSingleElementBox(element);
      newEl.style.display = "flex";
      diClass.appendChild(newEl);
      diClass = newEl;
      for (let i = 0; i < element.children.length; i++) {
        rec(element.children[i], diClass);
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
      //createSingleElementBox(bodyTree);
      createSingleElementBox2(bodyTree);
    }
  };
})(document);
