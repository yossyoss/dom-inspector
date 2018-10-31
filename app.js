(function(document) {
    
  document.addEventListener("DOMContentLoaded", () =>
    makeDomElelemts(document)
  );
  const elementToColor = {};

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getColor = nodeName => {
    if (elementToColor[nodeName]) {
      return elementToColor[nodeName];
    }
    elementToColor[nodeName] = getRandomColor();
    return elementToColor[nodeName];
  };

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
        //parentName: node.parentNode.nodeName,
        color: getColor(node.nodeName),
        children: children
      };
    }

    return false;
  };

  const makeDomElelemts = document => {
    let bodyEl;
    try {
      bodyEl = document.getElementsByTagName("body")[0];
    } catch (e) {
      throw new Error("Not a valid html");
    }
    if (bodyEl) {
      let obj = getNodeTree(bodyEl);
      debugger;
      console.log(obj);

      //     body[0].forEach(function(node) {
      //       // Do whatever you want with the node object.
      //       console.log(node);
      //     });
    }
  };
})(document);
